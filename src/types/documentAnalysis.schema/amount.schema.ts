import { z } from "zod";

export const amountSchema = z.object({
  value: z.number(),
  currency: z.string().regex(/^[A-Z]{3}$/, "must be an uppercase ISO 4217 code"),
  context: z.string(),
});

export type Amount = z.infer<typeof amountSchema>;
