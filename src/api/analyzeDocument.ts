import { documentAnalysisSchema, type DocumentAnalysis } from "../types/documentAnalysis.schema";
import type { ErrorKind } from "../types/errorKind";

export class AnalysisError extends Error {
  readonly kind: ErrorKind;

  constructor(message: string, kind: ErrorKind) {
    super(message);
    this.kind = kind;
  }
}

const GENERIC_FILE_ERROR = "Nieprawidłowy plik. Wybierz plik PDF i spróbuj ponownie.";
const GENERIC_TRANSIENT_ERROR = "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
const RATE_LIMIT_ERROR = "Zbyt wiele żądań. Spróbuj ponownie za chwilę.";
const CONNECTION_ERROR = "Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.";
const INVALID_RESPONSE_ERROR = "Odpowiedź serwera nie zgadza się z oczekiwanym formatem.";

function errorFromBody(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "error" in body) {
    return String((body as { error: unknown }).error);
  }
  return undefined;
}

/**
 * Maps a non-2xx /api/analyze response onto the two CTAs the UI can offer:
 * "file" (same bytes will fail again, user must pick another file) or
 * "transient" (worth retrying the same file). See the backend's error
 * catalog: 400/422-with-`error` are file problems; 429/500/502 and the
 * FastAPI default validation shape ({"detail": [...]}) are not.
 */
function resolveError(status: number, body: unknown): AnalysisError {
  const message = errorFromBody(body);

  if (status === 429) {
    return new AnalysisError(RATE_LIMIT_ERROR, "transient");
  }
  if (status === 400 || status === 422) {
    return new AnalysisError(message ?? GENERIC_FILE_ERROR, "file");
  }
  if (status === 500 || status === 502) {
    return new AnalysisError(message ?? GENERIC_TRANSIENT_ERROR, "transient");
  }
  return new AnalysisError(message ?? GENERIC_TRANSIENT_ERROR, "transient");
}

export async function analyzeDocument(file: File): Promise<DocumentAnalysis> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new AnalysisError(CONNECTION_ERROR, "transient");
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON body (e.g. a gateway error page) — fall through to the generic messages below.
  }

  if (!response.ok) {
    throw resolveError(response.status, body);
  }

  const parsed = documentAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    throw new AnalysisError(INVALID_RESPONSE_ERROR, "transient");
  }

  return parsed.data;
}
