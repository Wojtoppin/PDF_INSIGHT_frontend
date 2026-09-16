import { z } from "zod";
import { documentSchema } from "./document.schema";
import { entitiesSchema } from "./entities.schema";
import { amountSchema } from "./amount.schema";
import { dateEntrySchema } from "./dateEntry.schema";

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
