import { describe, it, expect, vi, beforeEach } from "vitest";
import { retrieveRelevantChunks } from "../lib/rag/retrieval";
import prisma from "../lib/db/prisma";
import * as embeddingLib from "../lib/ai/embedding";

// Mock the dependencies
vi.mock("../lib/db/prisma", () => ({
  default: {
    document: {
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
  }
}));

vi.mock("../lib/ai/embedding", () => ({
  generateEmbeddings: vi.fn(),
}));

describe("Retrieval Engine", () => {
  const MOCK_DOC_ID = "doc-123";

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for a successful path
    vi.mocked(prisma.document.findUnique).mockResolvedValue({ 
      id: MOCK_DOC_ID, 
      filename: "test.pdf", 
      status: "READY",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    vi.mocked(embeddingLib.generateEmbeddings).mockResolvedValue([
      new Array(768).fill(0.1)
    ]);
    
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      {
        id: "chunk-1",
        documentId: MOCK_DOC_ID,
        content: "Company provides 20 days of annual leave.",
        pageNumber: 1,
        chunkIndex: 0,
        distance: 0.12
      }
    ]);
  });

  describe("Validation", () => {
    it("should throw if documentId is missing", async () => {
      await expect(retrieveRelevantChunks("", "test")).rejects.toThrow("Invalid document ID.");
    });

    it("should throw if query is empty", async () => {
      await expect(retrieveRelevantChunks(MOCK_DOC_ID, "   ")).rejects.toThrow("Query cannot be empty.");
    });

    it("should throw if topK is invalid", async () => {
      await expect(retrieveRelevantChunks(MOCK_DOC_ID, "test", 0)).rejects.toThrow("TopK must be a positive integer");
      await expect(retrieveRelevantChunks(MOCK_DOC_ID, "test", 100)).rejects.toThrow("TopK must be a positive integer");
    });
  });

  describe("Document Status Check", () => {
    it("should throw if document does not exist", async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValueOnce(null);
      await expect(retrieveRelevantChunks(MOCK_DOC_ID, "test")).rejects.toThrow("Document not found.");
    });

    it("should throw if document is not READY", async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValueOnce({
        id: MOCK_DOC_ID, 
        filename: "test.pdf", 
        status: "PROCESSING",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await expect(retrieveRelevantChunks(MOCK_DOC_ID, "test")).rejects.toThrow("Document is not ready for retrieval.");
    });
  });

  describe("Vector Retrieval & Isolation", () => {
    it("should call embedding service and query raw SQL correctly", async () => {
      const results = await retrieveRelevantChunks(MOCK_DOC_ID, "annual leave policy", 3);
      
      expect(embeddingLib.generateEmbeddings).toHaveBeenCalledWith(["annual leave policy"]);
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      // Ensure the correct structure is returned and preserves metadata
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe("Company provides 20 days of annual leave.");
      expect(results[0].pageNumber).toBe(1);
      expect(results[0].distance).toBe(0.12);
    });
  });
});
