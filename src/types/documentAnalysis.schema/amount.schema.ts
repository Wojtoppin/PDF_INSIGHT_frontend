import { z } from "zod";

export const amountSchema = z.object({
  value: z.number(),
  currency: z.string().length(3),
  context: z.string(),
});

export type Amount = z.infer<typeof amountSchema>;
