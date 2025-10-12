import { z } from "zod";

const newPassword = z.string().min(8, "Passwords are at least 8 characters long");
const confirmPassword = z.string().min(8, "Passwords are at least 8 characters long");

export const email = z.email("Invalid email address");

export const code = z.string().refine((x) => /^\d{6}$/.test(x), {
  message: "Code must be a 6-digit number"
});

export const loginFormSchema = z.object({
  email,
  "current-password": z.string().min(8, "Passwords are at least 8 characters")
});

export const signupFormSchema = z
  .object({
    email: z.email("Invalid email address"),
    ["new-password"]: newPassword,
    ["confirm-password"]: confirmPassword
  })
  .refine((data) => data["new-password"] === data["confirm-password"], {
    message: "The new password and confirmation password must match",
    path: ["confirm-password"]
  });

export type LoginFormSchema = typeof loginFormSchema;
export type SignupFormSchema = typeof signupFormSchema;
