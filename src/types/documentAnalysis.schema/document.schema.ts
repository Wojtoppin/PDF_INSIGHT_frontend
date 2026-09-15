import { z } from "zod";
import { documentTypeSchema } from "./documentType.schema";

export const documentSchema = z.object({
  fileName: z.string(),
  pages: z.number().int().positive(),
  language: z.string().length(2),
  type: documentTypeSchema,
  title: z.string(),
  date: z.string().nullable(),
});

export type Document = z.infer<typeof documentSchema>;
