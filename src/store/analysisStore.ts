import { create } from "zustand";
import { analyzeDocument } from "../api/analyzeDocument";
import { validateFile } from "../helpers/validateFile";
import type { DocumentAnalysis } from "../types/documentAnalysis.schema";

export type AnalysisStatus = "idle" | "processing" | "success" | "error";
export type ErrorKind = "validation" | "analysis";

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

async function runAnalysis(file: File): Promise<DocumentAnalysis> {
  try {
    return await analyzeDocument(file);
  } catch {
    // One silent retry on a bad AI response, per the brief's schema-validation contract.
    return await analyzeDocument(file);
  }
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
        errorKind: "validation",
      });
      return;
    }

    set({ status: "processing", file, result: null, errorMessage: null, errorKind: null });

    try {
      const result = await runAnalysis(file);
      set({ status: "success", result, errorMessage: null, errorKind: null });
    } catch {
      set({
        status: "error",
        errorMessage: "Nie udało się przeanalizować dokumentu. Spróbuj ponownie.",
        errorKind: "analysis",
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
