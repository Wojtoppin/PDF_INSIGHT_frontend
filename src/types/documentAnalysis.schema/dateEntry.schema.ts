import { z } from "zod";

export const dateEntrySchema = z.object({
  date: z.iso.date(),
  context: z.string(),
});

export type DateEntry = z.infer<typeof dateEntrySchema>;
