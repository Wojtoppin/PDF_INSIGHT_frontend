import { z } from "zod";
import { documentSchema } from "./documentAnalysis.schema/document.schema";
import { entitiesSchema } from "./documentAnalysis.schema/entities.schema";
import { amountSchema } from "./documentAnalysis.schema/amount.schema";
import { dateEntrySchema } from "./documentAnalysis.schema/dateEntry.schema";

export const documentAnalysisSchema = z.object({
  document: documentSchema,
  summary: z.string(),
  keyPoints: z.array(z.string()).min(3).max(7),
  entities: entitiesSchema,
  amounts: z.array(amountSchema),
  dates: z.array(dateEntrySchema),
  keywords: z.array(z.string()),
});

export type DocumentAnalysis = z.infer<typeof documentAnalysisSchema>;
