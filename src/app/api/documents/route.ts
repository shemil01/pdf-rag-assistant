import { NextResponse } from "next/server";
import { DOCUMENT_LIMITS, ErrorCodes, hasPdfSignature } from "@/lib/validation/document";
import { extractPdfText } from "@/lib/pdf/extract-pdf-text";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: ErrorCodes.MISSING_FILE, message: "No file provided in the request." } },
        { status: 400 }
      );
    }

    // 1. File Size Validation
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

    // 2. MIME Type Validation
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: { code: ErrorCodes.INVALID_FILE_TYPE, message: "Only PDF files are supported." } },
        { status: 415 }
      );
    }

    // 3. Magic Bytes Validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    if (!hasPdfSignature(buffer)) {
      return NextResponse.json(
        { error: { code: ErrorCodes.INVALID_PDF_SIGNATURE, message: "The file is not a valid PDF document based on its contents." } },
        { status: 422 }
      );
    }

    // 4. Extraction
    try {
      const result = await extractPdfText(buffer);
      
      // Check if there is meaningful text
      if (result.totalCharacters < DOCUMENT_LIMITS.MIN_MEANINGFUL_TEXT_LENGTH) {
        return NextResponse.json(
          { error: { code: ErrorCodes.NO_EXTRACTABLE_TEXT, message: "The PDF appears to contain no extractable text. Scanned PDFs are not yet supported." } },
          { status: 422 }
        );
      }

      // Day 2 MVP: Just return the extracted data summary
      return NextResponse.json({
        id: crypto.randomUUID(), // Mock ID for now until DB is added
        filename: file.name,
        status: "READY",
        pageCount: result.pageCount,
        totalCharacters: result.totalCharacters,
        preview: result.fullText.substring(0, 200) + "..."
      }, { status: 200 });

    } catch (parseError: any) {
      console.error("PDF Parsing Error:", parseError);
      
      if (parseError.message?.includes("maximum allowed pages")) {
         return NextResponse.json(
          { error: { code: ErrorCodes.TOO_MANY_PAGES, message: parseError.message } },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { error: { code: ErrorCodes.PROCESSING_ERROR, message: "Failed to parse the PDF document. It may be malformed or encrypted." } },
        { status: 422 }
      );
    }

  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred during upload." } },
      { status: 500 }
    );
  }
}
