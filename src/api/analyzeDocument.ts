import { documentAnalysisSchema, type DocumentAnalysis } from "../types/documentAnalysis.schema";

export class AnalysisError extends Error {}

const MOCK_DELAY_MS = 1600;

function buildMockAnalysis(file: File): unknown {
  return {
    document: {
      fileName: file.name,
      pages: 4,
      language: "pl",
      type: "umowa",
      title: "Umowa serwisowa",
      date: "2026-09-01",
    },
    summary:
      "Umowa określa zasady świadczenia usług serwisowych przez okres 12 miesięcy. Strony ustaliły miesięczne wynagrodzenie oraz termin płatności. Dokument zawiera również warunki wypowiedzenia i zakres odpowiedzialności wykonawcy.",
    keyPoints: [
      "Okres umowy: 12 miesięcy",
      "Wynagrodzenie miesięczne: 12 500 PLN",
      "Termin płatności: do 10. dnia miesiąca",
      "Możliwość wypowiedzenia z 30-dniowym okresem",
    ],
    entities: {
      organizations: ["Przykład sp. z o.o.", "Kontrahent SA"],
      people: [],
    },
    amounts: [{ value: 12500.0, currency: "PLN", context: "wynagrodzenie miesięczne" }],
    dates: [{ date: "2026-10-01", context: "termin płatności pierwszej faktury" }],
    keywords: ["serwis", "SLA", "wynagrodzenie"],
  };
}

/**
 * Placeholder for the real call to the Cloudflare Worker proxy (VITE_API_URL).
 * Mirrors the retry-once-on-invalid-response contract from the brief so the
 * store logic doesn't change when this is swapped for a real fetch.
 */
export async function analyzeDocument(file: File): Promise<DocumentAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const raw = buildMockAnalysis(file);
  const parsed = documentAnalysisSchema.safeParse(raw);

  if (!parsed.success) {
    throw new AnalysisError("Odpowiedź AI nie zgadza się ze schematem danych.");
  }

  return parsed.data;
}
