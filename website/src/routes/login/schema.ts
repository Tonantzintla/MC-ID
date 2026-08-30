import { type ZxcvbnResult, ZxcvbnFactory } from "@zxcvbn-ts/core";
import { adjacencyGraphs, dictionary as commonDictionary } from "@zxcvbn-ts/language-common";
import { dictionary as englishDictionary, translations } from "@zxcvbn-ts/language-en";
import { z } from "zod";

const zxcvbn = new ZxcvbnFactory({
  translations,
  graphs: adjacencyGraphs,
  dictionary: {
    ...commonDictionary,
    ...englishDictionary
  }
});

const newPassword = z
  .string()
  .min(8, "Passwords are at least 8 characters long")
  .refine((x) => /[A-Z]/.test(x), {
    message: "Passwords must contain at least one uppercase letter"
  })
  .refine((x) => /[a-z]/.test(x), {
    message: "Passwords must contain at least one lowercase letter"
  })
  .refine((x) => /\d/.test(x), {
    message: "Passwords must contain at least one number"
  })
  .refine((x) => /[!@#$%^&*(),.?":{}|<>]/.test(x), {
    message: "Passwords must contain at least one special character"
  })
  .refine((x) => {
    const result: ZxcvbnResult = zxcvbn.check(x);
    return result.score >= 3;
  }, "Password is too weak");

const confirmPassword = newPassword;

export const email = z.email("Invalid email address");

export const code = z.string().refine((x) => /^\d{6}$/.test(x), {
  message: "Code must be a 6-digit number"
});

export const loginFormSchema = z.object({
  email,
  "current-password": newPassword
});

export const signupFormSchema = z
  .object({
    email,
    ["new-password"]: newPassword,
    ["confirm-password"]: confirmPassword
  })
  .refine((data) => data["new-password"] === data["confirm-password"], {
    message: "The new password and confirmation password must match",
    path: ["confirm-password"]
  });

export type LoginFormSchema = typeof loginFormSchema;
export type SignupFormSchema = typeof signupFormSchema;

export { newPassword as password };
