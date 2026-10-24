import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(100),
  role: z.enum(["ADMIN", "CONTRIBUTOR"]).default("CONTRIBUTOR"),
});

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(100),
});
