import { z } from "zod";
import { documentAnalysisSchema } from "./documentAnalysis.schema/documentAnalysis.schema";

export const historyEntrySchema = z.object({
  id: z.string(),
  analyzedAt: z.iso.datetime(),
  result: documentAnalysisSchema,
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;
