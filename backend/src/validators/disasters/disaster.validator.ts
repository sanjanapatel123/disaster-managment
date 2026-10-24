import { z } from "zod";

export const createDisasterSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(2000),
  location: z.string().trim().min(2).max(200).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const updateDisasterSchema = createDisasterSchema
  .partial()
  .extend({
    status: z.enum(["ACTIVE", "RESOLVED"]).optional(),
  });
