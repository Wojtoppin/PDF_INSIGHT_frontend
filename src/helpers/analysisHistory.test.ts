import { beforeEach, describe, expect, it, vi } from "vitest";
import { appendHistoryEntry, clearHistory, loadHistory } from "./analysisHistory";
import { HISTORY_LIMIT, HISTORY_STORAGE_KEY } from "../constants/history";
import type { DocumentAnalysis } from "../types/documentAnalysis.schema/documentAnalysis.schema";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

function fakeResult(fileName: string): DocumentAnalysis {
  return {
    document: {
      fileName,
      pages: 1,
      language: "pl",
      type: "inne",
      title: fileName,
      date: null,
    },
    summary: "Krótkie podsumowanie testowego dokumentu spełniające minimalną długość.",
    keyPoints: ["punkt 1", "punkt 2", "punkt 3"],
    entities: { organizations: [], people: [] },
    amounts: [],
    dates: [],
    keywords: [],
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createMemoryStorage());
});

describe("analysisHistory", () => {
  it("returns an empty array when nothing has been stored", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("appends a new entry and makes it loadable", () => {
    appendHistoryEntry(fakeResult("a.pdf"));
    const history = loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].result.document.fileName).toBe("a.pdf");
  });

  it("keeps the newest entry first", () => {
    appendHistoryEntry(fakeResult("first.pdf"));
    appendHistoryEntry(fakeResult("second.pdf"));
    const history = loadHistory();
    expect(history[0].result.document.fileName).toBe("second.pdf");
    expect(history[1].result.document.fileName).toBe("first.pdf");
  });

  it(`caps history at ${HISTORY_LIMIT} entries, dropping the oldest`, () => {
    for (let i = 0; i < HISTORY_LIMIT + 2; i++) {
      appendHistoryEntry(fakeResult(`file-${i}.pdf`));
    }
    const history = loadHistory();
    expect(history).toHaveLength(HISTORY_LIMIT);
    expect(history[0].result.document.fileName).toBe(`file-${HISTORY_LIMIT + 1}.pdf`);
    expect(history.some((entry) => entry.result.document.fileName === "file-0.pdf")).toBe(false);
  });

  it("drops entries that no longer match the schema instead of crashing", () => {
    appendHistoryEntry(fakeResult("valid.pdf"));
    const corrupted = [
      { id: "bad", analyzedAt: "not-a-date", result: { nope: true } },
      ...loadHistory(),
    ];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(corrupted));

    const history = loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].result.document.fileName).toBe("valid.pdf");
  });

  it("returns an empty array if the stored value isn't valid JSON", () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, "{not json");
    expect(loadHistory()).toEqual([]);
  });

  it("clears all stored history", () => {
    appendHistoryEntry(fakeResult("a.pdf"));
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});
