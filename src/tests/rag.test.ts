import { describe, it, expect } from "vitest";
import { cleanText } from "../lib/pdf/clean-text";
import { chunkText } from "../lib/rag/chunk-text";

describe("cleanText", () => {
  it("should remove excessive whitespace and normalise spaces", () => {
    const input = "Hello   \t  World!  \n\n\n\n This is  a test. ";
    const expected = "Hello World!\n\nThis is a test.";
    expect(cleanText(input)).toBe(expected);
  });
  
  it("should handle empty strings", () => {
    expect(cleanText("")).toBe("");
    expect(cleanText("   ")).toBe("");
  });
});

describe("chunkText", () => {
  const pages = [
    { pageNumber: 1, text: "A".repeat(1500) },
    { pageNumber: 2, text: "B".repeat(500) },
    { pageNumber: 3, text: "  " }, // empty page
  ];

  it("should split large text into chunks of specified size and overlap", () => {
    const chunks = chunkText(pages, 1000, 200);
    // Page 1:
    // Chunk 0: 0 to 1000. Next start: 1000 - 200 = 800
    // Chunk 1: 800 to 1500 (length 700). 
    // Page 2:
    // Chunk 2: 0 to 500
    expect(chunks.length).toBe(3);
    
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].content.length).toBe(1000);
    
    expect(chunks[1].pageNumber).toBe(1);
    expect(chunks[1].content.length).toBe(700);
    
    expect(chunks[2].pageNumber).toBe(2);
    expect(chunks[2].content.length).toBe(500);
  });
  
  it("should generate deterministic sequential indexes", () => {
    const chunks = chunkText(pages, 1000, 200);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[1].chunkIndex).toBe(1);
    expect(chunks[2].chunkIndex).toBe(2);
  });

  it("should avoid infinite loops and validate parameters", () => {
    expect(() => chunkText(pages, 200, 200)).toThrow();
    expect(() => chunkText(pages, 0, 10)).toThrow();
  });
});
