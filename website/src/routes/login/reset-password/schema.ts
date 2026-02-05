import { z } from "zod";
import { password } from "../schema";

export const resetPasswordFormSchema = z
  .object({
    ["new-password"]: password,
    ["confirm-password"]: password,
    token: z.string()
  })
  .refine((data) => data["new-password"] === data["confirm-password"], {
    message: "The new password and confirmation password must match",
    path: ["confirm-password"]
  });

export type ResetPasswordFormSchema = typeof resetPasswordFormSchema;
