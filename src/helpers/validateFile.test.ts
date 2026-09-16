import { describe, expect, it } from "vitest";
import { validateFile } from "./validateFile";
import { MAX_FILE_SIZE_BYTES } from "../constants/upload";

function pdfFile(name: string, sizeBytes: number) {
  return new File([new Uint8Array(sizeBytes)], name, { type: "application/pdf" });
}

describe("validateFile", () => {
  it("accepts a PDF under the size limit", () => {
    const result = validateFile(pdfFile("umowa.pdf", 1024));
    expect(result.ok).toBe(true);
  });

  it("rejects a non-PDF mime type", () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    const result = validateFile(file);
    expect(result).toEqual({ ok: false, message: expect.stringContaining("PDF") });
  });

  it("accepts a .pdf file even without a matching mime type (e.g. some drag&drop sources)", () => {
    const file = new File([new Uint8Array(10)], "umowa.pdf", { type: "" });
    const result = validateFile(file);
    expect(result.ok).toBe(true);
  });

  it("rejects a file over the size limit", () => {
    const result = validateFile(pdfFile("big.pdf", MAX_FILE_SIZE_BYTES + 1));
    expect(result).toEqual({ ok: false, message: expect.stringContaining("10 MB") });
  });

  it("accepts a file exactly at the size limit", () => {
    const result = validateFile(pdfFile("edge.pdf", MAX_FILE_SIZE_BYTES));
    expect(result.ok).toBe(true);
  });
});
