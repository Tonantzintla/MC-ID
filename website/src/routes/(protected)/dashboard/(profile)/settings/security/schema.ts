import { z } from "zod";

const currentPassword = z.string().min(8, "Passwords are at least 8 characters long");
const newPassword = z.string().min(8, "Passwords are at least 8 characters long");
const confirmPassword = z.string().min(8, "Passwords are at least 8 characters long");

export const passwordUpdateSchema = z
  .object({
    ["current-password"]: currentPassword,
    ["new-password"]: newPassword,
    ["confirm-password"]: confirmPassword
  })
  .refine((data) => data["new-password"] === data["confirm-password"], {
    message: "The new password and confirmation password must match",
    path: ["confirm-password"]
  });

export type PasswordUpdateSchema = typeof passwordUpdateSchema;
