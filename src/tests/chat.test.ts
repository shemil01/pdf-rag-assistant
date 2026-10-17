import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { chatAction } from "../app/actions/chat.actions";

describe("chatAction", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should send messages and documentId to the chat backend and return data", async () => {
    const mockData = { reply: "Hello from assistant" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const messages = [{ role: "user", content: "Hello" }];
    const documentId = "doc-123";

    const result = await chatAction(messages, documentId);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/chat"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, documentId }),
      })
    );
    expect(result).toEqual(mockData);
  });

  it("should throw an error when backend response is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(
      chatAction([{ role: "user", content: "Hi" }], "doc-123")
    ).rejects.toThrow("An unexpected error occurred during chat");
  });

  it("should throw an error when network request fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection error"));

    await expect(
      chatAction([{ role: "user", content: "Hi" }], "doc-123")
    ).rejects.toThrow("An unexpected error occurred during chat");
  });
});
