import { create } from "zustand";
import { analyzeDocument, AnalysisError } from "../api/analyzeDocument";
import { validateFile } from "../helpers/validateFile";
import type { AnalysisStatus } from "../types/analysisStatus";
import type { DocumentAnalysis } from "../types/documentAnalysis.schema";
import type { ErrorKind } from "../types/errorKind";

interface AnalysisState {
  status: AnalysisStatus;
  file: File | null;
  result: DocumentAnalysis | null;
  errorMessage: string | null;
  errorKind: ErrorKind | null;
  submit: (file: File) => Promise<void>;
  retry: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  status: "idle",
  file: null,
  result: null,
  errorMessage: null,
  errorKind: null,

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
      set({ status: "success", result, errorMessage: null, errorKind: null });
    } catch (err) {
      const isAnalysisError = err instanceof AnalysisError;
      set({
        status: "error",
        errorMessage: isAnalysisError ? err.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
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
}));
