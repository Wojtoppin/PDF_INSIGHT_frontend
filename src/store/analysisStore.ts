import { create } from "zustand";
import { analyzeDocument, AnalysisError } from "../api/analyzeDocument";
import { validateFile } from "../helpers/validateFile";
import {
  appendHistoryEntry,
  clearHistory as clearHistoryStorage,
  loadHistory,
} from "../helpers/analysisHistory";
import type { AnalysisStatus } from "../types/analysisStatus";
import type { DocumentAnalysis } from "../types/documentAnalysis.schema/documentAnalysis.schema";
import type { ErrorKind } from "../types/errorKind";
import type { HistoryEntry } from "../types/historyEntry.schema";

interface AnalysisState {
  status: AnalysisStatus;
  file: File | null;
  result: DocumentAnalysis | null;
  errorMessage: string | null;
  errorKind: ErrorKind | null;
  history: HistoryEntry[];
  submit: (file: File) => Promise<void>;
  retry: () => void;
  reset: () => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  status: "idle",
  file: null,
  result: null,
  errorMessage: null,
  errorKind: null,
  history: loadHistory(),

  submit: async (file) => {
    const validation = validateFile(file);
    if (!validation.ok) {
      set({
        status: "error",
        file,
        result: null,
        errorMessage: validation.message,
        errorKind: "file",
      });
      return;
    }

    set({ status: "processing", file, result: null, errorMessage: null, errorKind: null });

    try {
      const result = await analyzeDocument(file);
      const history = appendHistoryEntry(result);
      set({ status: "success", result, errorMessage: null, errorKind: null, history });
    } catch (err) {
      const isAnalysisError = err instanceof AnalysisError;
      set({
        status: "error",
        errorMessage: isAnalysisError
          ? err.message
          : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        errorKind: isAnalysisError ? err.kind : "transient",
      });
    }
  },

  retry: () => {
    const { file, submit } = get();
    if (file) void submit(file);
  },

  reset: () =>
    set({ status: "idle", file: null, result: null, errorMessage: null, errorKind: null }),

  loadFromHistory: (id) => {
    const entry = get().history.find((item) => item.id === id);
    if (!entry) return;
    set({
      status: "success",
      file: null,
      result: entry.result,
      errorMessage: null,
      errorKind: null,
    });
  },

  clearHistory: () => {
    clearHistoryStorage();
    set({ history: [] });
  },
}));
