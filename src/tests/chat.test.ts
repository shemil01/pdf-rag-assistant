import { describe, it, expect, vi } from "vitest";
import { POST } from "../app/api/chat/route";

import prisma from "../lib/db/prisma";

vi.mock("ai", () => ({
  streamText: vi.fn(),
  Message: vi.fn()
}));

vi.mock("../lib/db/prisma", () => ({
  default: {
    document: {
      findUnique: vi.fn(),
    },
  }
}));

describe("Chat API Route", () => {
  it("should return 400 if documentId is missing", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid or missing documentId");
  });

  it("should return 400 if messages are missing or empty", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ documentId: "123", messages: [] })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Messages array is required");
  });

  it("should return 400 if last message is not from user", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ 
        documentId: "123", 
        messages: [{ role: "assistant", content: "Hello" }] 
      })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 if document does not exist", async () => {
    vi.mocked(prisma.document.findUnique).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ 
        documentId: "123", 
        messages: [{ role: "user", content: "Hello" }] 
      })
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should return 400 if document is not READY", async () => {
    vi.mocked(prisma.document.findUnique).mockResolvedValueOnce({
      id: "123", filename: "test", status: "PROCESSING", createdAt: new Date(), updatedAt: new Date()
    });
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ 
        documentId: "123", 
        messages: [{ role: "user", content: "Hello" }] 
      })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("still being processed");
  });
});
