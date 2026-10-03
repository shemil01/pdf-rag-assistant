import { describe, it, expect, vi } from "vitest";
import { buildContext } from "../lib/rag/context-builder";
import { getRagSystemPrompt } from "../lib/ai/prompts";
import { generateGroundedAnswer } from "../lib/ai/generation";
import * as aiModule from "ai";

// Mock the Vercel AI SDK
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

// Mock the Google Provider
vi.mock("@ai-sdk/google", () => ({
  google: vi.fn().mockReturnValue("mock-google-model"),
}));

describe("RAG Context Builder", () => {
  it("should return empty context structure when no chunks are provided", () => {
    const context = buildContext([]);
    expect(context).toBe("<document_context>\n\n</document_context>");
  });

  it("should format retrieved chunks with page metadata correctly", () => {
    const chunks = [
      { id: "1", documentId: "doc1", content: "Chunk A", pageNumber: 1, chunkIndex: 0, distance: 0.1 },
      { id: "2", documentId: "doc1", content: "Chunk B", pageNumber: 2, chunkIndex: 1, distance: 0.2 },
    ];
    
    const context = buildContext(chunks);
    
    expect(context).toContain("<document_context>");
    expect(context).toContain('<source page="1" chunk="0">\nChunk A\n</source>');
    expect(context).toContain('<source page="2" chunk="1">\nChunk B\n</source>');
    expect(context).toContain("</document_context>");
  });
});

describe("RAG Prompts", () => {
  it("should contain injection defense and strict grounding instructions", () => {
    const prompt = getRagSystemPrompt();
    expect(prompt).toContain("based ONLY on the provided context");
    expect(prompt).toContain("I cannot find the answer in the provided document");
    expect(prompt).toContain("untrusted data");
  });
});

describe("Gemini Generation Service (Mocked)", () => {
  it("should return fallback immediately if context is empty without calling LLM", async () => {
    const answer = await generateGroundedAnswer({
      question: "What is the policy?",
      contextString: "<document_context>\n\n</document_context>"
    });
    
    expect(answer).toBe("I cannot find the answer in the provided document.");
    expect(aiModule.generateText).not.toHaveBeenCalled();
  });

  it("should call generateText and return answer when context is valid", async () => {
    vi.mocked(aiModule.generateText).mockResolvedValueOnce({
      text: "20 days of annual leave.",
      finishReason: "stop",
    } as any);

    const contextStr = buildContext([
      { id: "1", documentId: "doc", content: "20 days leave", pageNumber: 1, chunkIndex: 0, distance: 0.1 }
    ]);

    const answer = await generateGroundedAnswer({
      question: "How much leave?",
      contextString: contextStr,
    });

    expect(answer).toBe("20 days of annual leave.");
    expect(aiModule.generateText).toHaveBeenCalledWith(expect.objectContaining({
      temperature: 0.1,
      system: expect.stringContaining("untrusted data"),
      prompt: expect.stringContaining("20 days leave"),
    }));
  });
});
