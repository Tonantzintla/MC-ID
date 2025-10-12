import { z } from "zod";

export const username = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(16, "Username must be at most 16 characters")
  // minecraft username regex is /^[a-zA-Z0-9_]{3,16}$/
  .regex(/^[a-zA-Z0-9_]{3,16}$/, "Username must be 3-16 characters and only contain letters, numbers, and underscores");

export const code = z.string().refine((x) => /^\d{6}$/.test(x), {
  message: "Code must be a 6-digit number"
});

export const requestCodeFormSchema = z.object({
  username
});

export const verifyCodeFormSchema = z.object({
  username,
  code
});

export type requestCodeFormSchema = typeof requestCodeFormSchema;
export type verifyCodeFormSchema = typeof verifyCodeFormSchema;
