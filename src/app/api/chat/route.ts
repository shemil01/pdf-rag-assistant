import { NextResponse } from "next/server";
import { streamText, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";
import { buildContext } from "@/lib/rag/context-builder";
import { getRagSystemPrompt } from "@/lib/ai/prompts";
import { GENERATION_MODEL } from "@/lib/ai/generation";
import prisma from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { messages, documentId } = await req.json();

    // 1. Validation
    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json({ error: "Invalid or missing documentId" }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required and cannot be empty" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1] as UIMessage;
    
    const userTextPart = lastMessage?.parts?.find(p => p.type === 'text') as any;
    const query = userTextPart?.text || "";

    if (!lastMessage || lastMessage.role !== "user" || !query) {
      return NextResponse.json({ error: "The latest message must be a valid user query" }, { status: 400 });
    }

    // 2. Document existence/status check
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (document.status === "PROCESSING") {
      return NextResponse.json({ error: "This document is still being processed. Please try again shortly." }, { status: 400 });
    }
    if (document.status !== "READY") {
      return NextResponse.json({ error: "This document is not ready for querying." }, { status: 400 });
    }

    // 3. Vector Retrieval
    const retrievedChunks = await retrieveRelevantChunks(documentId, query, 5);

    // 4. Build Context
    const contextString = buildContext(retrievedChunks);

    // 5. Build prompt
    const prompt = `DOCUMENT CONTEXT:\n${contextString}\n\nUSER QUESTION:\n${query}`;

    // 6. Extract source metadata (Unique page numbers)
    const uniquePages = Array.from(new Set(retrievedChunks.map(c => c.pageNumber))).sort((a, b) => a - b);
    
    const headers = new Headers();
    headers.set("x-sources", JSON.stringify(uniquePages));

    if (retrievedChunks.length === 0) {
       const emptyStream = new ReadableStream({
         start(controller) {
           controller.enqueue(new TextEncoder().encode('0:"I cannot find the answer in the provided document."\n'));
           controller.close();
         }
       });
       return new Response(emptyStream, { 
         headers: { "Content-Type": "text/plain; charset=utf-8", "x-sources": "[]" } 
       });
    }

    // 7. Generation and Streaming
    const result = streamText({
      model: google(GENERATION_MODEL),
      system: getRagSystemPrompt(),
      prompt: prompt,
      temperature: 0.1,
    });

    return result.toTextStreamResponse({ headers });
    
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "We couldn't process your request. Please try again." }, 
      { status: 500 }
    );
  }
}
