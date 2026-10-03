import { NextResponse } from "next/server";
import { DOCUMENT_LIMITS, ErrorCodes, hasPdfSignature } from "@/lib/validation/document";
import { extractPdfText } from "@/lib/pdf/extract-pdf-text";
import { cleanText } from "@/lib/pdf/clean-text";
import { chunkText } from "@/lib/rag/chunk-text";
import { generateEmbeddings } from "@/lib/ai/embedding";
import prisma from "@/lib/db/prisma";

export async function POST(request: Request) {
  let documentId: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: ErrorCodes.MISSING_FILE, message: "No file provided in the request." } },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: { code: ErrorCodes.INVALID_FILE_TYPE, message: "The selected file is empty." } },
        { status: 400 }
      );
    }
    
    if (file.size > DOCUMENT_LIMITS.MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: { code: ErrorCodes.FILE_TOO_LARGE, message: `File size exceeds the limit of ${DOCUMENT_LIMITS.MAX_FILE_SIZE_MB}MB.` } },
        { status: 413 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: { code: ErrorCodes.INVALID_FILE_TYPE, message: "Only PDF files are supported." } },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    if (!hasPdfSignature(buffer)) {
      return NextResponse.json(
        { error: { code: ErrorCodes.INVALID_PDF_SIGNATURE, message: "The file is not a valid PDF document based on its contents." } },
        { status: 422 }
      );
    }

    // Step 1: Create Document as PROCESSING
    const doc = await prisma.document.create({
      data: {
        filename: file.name,
        status: "PROCESSING",
      }
    });
    documentId = doc.id;

    // Step 2: Extraction
    const extractionResult = await extractPdfText(buffer);
    
    if (extractionResult.totalCharacters < DOCUMENT_LIMITS.MIN_MEANINGFUL_TEXT_LENGTH) {
      throw new Error("NO_EXTRACTABLE_TEXT");
    }

    // Step 3: Cleaning
    const cleanedPages = extractionResult.pages.map(p => ({
      pageNumber: p.pageNumber,
      text: cleanText(p.text)
    }));

    // Step 4: Chunking
    const chunks = chunkText(cleanedPages);
    if (chunks.length === 0) {
      throw new Error("NO_EXTRACTABLE_TEXT");
    }

    // Step 5: Embeddings
    const textsToEmbed = chunks.map(c => c.content);
    const embeddings = await generateEmbeddings(textsToEmbed);

    // Step 6: Store Chunks + Embeddings
    // Execute inserts sequentially or in Promise.all to avoid huge single payload limits
    await prisma.$transaction(
      chunks.map((chunk, index) => {
        const embedding = embeddings[index];
        // Using raw SQL is necessary for pgvector casting
        return prisma.$executeRaw`
          INSERT INTO "DocumentChunk" ("id", "documentId", "content", "pageNumber", "chunkIndex", "embedding")
          VALUES (
            gen_random_uuid(), 
            ${documentId}, 
            ${chunk.content}, 
            ${chunk.pageNumber}, 
            ${chunk.chunkIndex}, 
            ${embedding}::vector
          )
        `;
      })
    );

    // Step 7: Mark as READY
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "READY" }
    });

    return NextResponse.json({
      id: documentId,
      filename: file.name,
      status: "READY",
      pageCount: extractionResult.pageCount,
      totalCharacters: extractionResult.totalCharacters,
      chunksCreated: chunks.length,
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upload/Ingestion API Error:", err);
    
    // Attempt to mark document as FAILED if we created it
    if (documentId) {
      try {
        await prisma.document.update({
          where: { id: documentId },
          data: { status: "FAILED" }
        });
      } catch (dbErr) {
        console.error("Failed to update document status to FAILED:", dbErr);
      }
    }

    const errorMsg = err.message || "";
    
    if (errorMsg === "NO_EXTRACTABLE_TEXT") {
      return NextResponse.json(
        { error: { code: ErrorCodes.NO_EXTRACTABLE_TEXT, message: "The PDF appears to contain no extractable text." } },
        { status: 422 }
      );
    }
    
    if (errorMsg.includes("maximum allowed pages")) {
       return NextResponse.json(
        { error: { code: ErrorCodes.TOO_MANY_PAGES, message: errorMsg } },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred during document ingestion." } },
      { status: 500 }
    );
  }
}
