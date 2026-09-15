import { z } from "zod";

export const documentTypeSchema = z.enum(["faktura", "umowa", "oferta", "raport", "inne"]);

export type DocumentType = z.infer<typeof documentTypeSchema>;
