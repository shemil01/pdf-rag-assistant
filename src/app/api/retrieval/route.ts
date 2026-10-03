import { NextResponse } from "next/server";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentId, query, topK = 5 } = body;

    if (!documentId || !query) {
      return NextResponse.json(
        { error: "Missing documentId or query in request body." },
        { status: 400 }
      );
    }

    const results = await retrieveRelevantChunks(documentId, query, topK);
    return NextResponse.json({ results }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    const errorMsg = err.message || "";
    
    if (errorMsg === "Document not found.") {
      return NextResponse.json({ error: errorMsg }, { status: 404 });
    }
    
    if (errorMsg === "Document is not ready for retrieval.") {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    
    console.error("Retrieval API Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during retrieval." },
      { status: 500 }
    );
  }
}
