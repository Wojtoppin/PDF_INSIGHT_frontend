import { z } from "zod";
import { documentTypeSchema } from "./documentType.schema";

// TODO: Separate all of the zod objects containing dates into separate getDocumentSchema and documentSchema
export const documentSchema = z.object({
  fileName: z.string(),
  pages: z.number().int().positive(),
  language: z.string().regex(/^[a-z]{2}$/, "must be a lowercase ISO 639-1 code"),
  type: documentTypeSchema,
  title: z.string(),
  date: z.iso.date().nullable(),
});

export type Document = z.infer<typeof documentSchema>;
