import { describe, expect, it } from "vitest";
import { documentAnalysisSchema, type DocumentAnalysis } from "./documentAnalysis.schema";

function validAnalysis(): DocumentAnalysis {
  return {
    document: {
      fileName: "umowa.pdf",
      pages: 4,
      language: "pl",
      type: "umowa",
      title: "Umowa serwisowa",
      date: "2026-09-01",
    },
    summary: "Umowa określa zasady świadczenia usług serwisowych przez okres 12 miesięcy.",
    keyPoints: [
      "Okres umowy 12 mies.",
      "Wynagrodzenie miesięczne 12500 PLN",
      "Termin płatności do 10.",
    ],
    entities: {
      organizations: ["Przykład sp. z o.o."],
      people: [],
    },
    amounts: [{ value: 12500, currency: "PLN", context: "wynagrodzenie" }],
    dates: [{ date: "2026-10-01", context: "termin płatności" }],
    keywords: ["serwis", "SLA"],
  };
}

describe("documentAnalysisSchema", () => {
  it("accepts a fully valid analysis", () => {
    const result = documentAnalysisSchema.safeParse(validAnalysis());
    expect(result.success).toBe(true);
  });

  it("accepts document.date as null", () => {
    const input = validAnalysis();
    input.document.date = null;
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects an unknown document.type", () => {
    const input = validAnalysis();
    // @ts-expect-error deliberately invalid for the test
    input.document.type = "kwitek";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a language code that isn't exactly 2 characters", () => {
    const input = validAnalysis();
    input.document.language = "pol";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a currency code that isn't exactly 3 characters", () => {
    const input = validAnalysis();
    input.amounts[0].currency = "ZL";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 3 keyPoints", () => {
    const input = validAnalysis();
    input.keyPoints = ["only one point"];
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects more than 7 keyPoints", () => {
    const input = validAnalysis();
    input.keyPoints = Array.from({ length: 8 }, (_, i) => `point ${i}`);
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a response missing a required field", () => {
    const input = validAnalysis();
    // @ts-expect-error deliberately invalid for the test
    delete input.summary;
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("does not fail on an extra field the model added", () => {
    const input = { ...validAnalysis(), confidence: 0.97 };
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
