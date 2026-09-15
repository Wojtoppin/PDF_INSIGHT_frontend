import { z } from "zod";

export const entitiesSchema = z.object({
  organizations: z.array(z.string()),
  people: z.array(z.string()),
});

export type Entities = z.infer<typeof entitiesSchema>;
