import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(4).max(20),
});
