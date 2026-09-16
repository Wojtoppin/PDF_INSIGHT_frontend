import { HISTORY_LIMIT, HISTORY_STORAGE_KEY } from "../constants/history";
import { historyEntrySchema, type HistoryEntry } from "../types/historyEntry.schema";
import type { DocumentAnalysis } from "../types/documentAnalysis.schema/documentAnalysis.schema";

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsedRaw = JSON.parse(raw);
    if (!Array.isArray(parsedRaw)) return [];
    return parsedRaw
      .map((item) => historyEntrySchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable (e.g. private browsing quota) — history is a convenience, not critical.
  }
}

export function appendHistoryEntry(result: DocumentAnalysis): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    analyzedAt: new Date().toISOString(),
    result,
  };
  const updated = [entry, ...loadHistory()].slice(0, HISTORY_LIMIT);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // ignore
  }
}
