import { describe, it, expect } from "vitest";
import { hasPdfSignature, DOCUMENT_LIMITS } from "../lib/validation/document";
import { extractPdfText } from "../lib/pdf/extract-pdf-text";

describe("PDF Validation", () => {
  it("should validate correct PDF magic bytes", () => {
    const validPdf = Buffer.from("%PDF-1.4\n%...", "utf-8");
    expect(hasPdfSignature(validPdf)).toBe(true);
  });

  it("should reject invalid magic bytes", () => {
    const invalidPdf = Buffer.from("PK\x03\x04", "utf-8"); // ZIP/DOCX
    expect(hasPdfSignature(invalidPdf)).toBe(false);
  });
});

describe("PDF Extraction Limits", () => {
  it("should enforce MIN_MEANINGFUL_TEXT_LENGTH correctly", () => {
    expect(DOCUMENT_LIMITS.MIN_MEANINGFUL_TEXT_LENGTH).toBe(50);
  });
});

describe("PDF Extraction (mocking unpdf for testing)", () => {
  // Normally we would use a real fixture, but to avoid committing binary blobs,
  // we're mocking the unpdf output behavior for basic structural checks if needed,
  // or just checking if parsing a malformed buffer throws.
  
  it("should throw error on invalid PDF buffer to unpdf", async () => {
    const invalidBuffer = new Uint8Array([0, 1, 2, 3]);
    await expect(extractPdfText(invalidBuffer)).rejects.toThrow();
  });
});
