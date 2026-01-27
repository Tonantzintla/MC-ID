import { z } from "zod";

export const banFormSchema = z.object({
  userID: z.string().min(1, "User ID is required"),
  reason: z.string().min(10, "Ban reason must be at least 10 characters").max(255, "Ban reason must be at most 255 characters"),
  duration: z.number().min(0, "Duration must be at least 0")
});

export type BanFormSchema = typeof banFormSchema;
