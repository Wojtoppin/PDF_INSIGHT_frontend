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

  it("accepts all-empty arrays when the model found nothing (brief's null/[] rule)", () => {
    const input = validAnalysis();
    input.entities = { organizations: [], people: [] };
    input.amounts = [];
    input.dates = [];
    input.keywords = [];
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

  it("rejects a language code that is uppercase", () => {
    const input = validAnalysis();
    input.document.language = "PL";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a document.date that isn't ISO 8601 (YYYY-MM-DD)", () => {
    const input = validAnalysis();
    input.document.date = "01-09-2026";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a dates[].date that isn't ISO 8601", () => {
    const input = validAnalysis();
    input.dates[0].date = "10 października 2026";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a currency code that isn't exactly 3 characters", () => {
    const input = validAnalysis();
    input.amounts[0].currency = "ZL";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a currency code that is lowercase", () => {
    const input = validAnalysis();
    input.amounts[0].currency = "pln";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a currency code containing digits", () => {
    const input = validAnalysis();
    input.amounts[0].currency = "PL1";
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects pages that are zero or negative", () => {
    const input = validAnalysis();
    input.document.pages = 0;
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer page count", () => {
    const input = validAnalysis();
    input.document.pages = 2.5;
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts exactly 3 keyPoints (lower bound)", () => {
    const input = validAnalysis();
    input.keyPoints = ["one", "two", "three"];
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts exactly 7 keyPoints (upper bound)", () => {
    const input = validAnalysis();
    input.keyPoints = Array.from({ length: 7 }, (_, i) => `point ${i}`);
    const result = documentAnalysisSchema.safeParse(input);
    expect(result.success).toBe(true);
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
