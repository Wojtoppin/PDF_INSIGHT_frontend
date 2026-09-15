import { z } from "zod";

export const dateEntrySchema = z.object({
  date: z.string(),
  context: z.string(),
});

export type DateEntry = z.infer<typeof dateEntrySchema>;
