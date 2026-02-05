import { z } from "zod";
import { email } from "../schema";

export const forgotPasswordSchema = z.object({
  email
});

export type ForgotPasswordFormSchema = typeof forgotPasswordSchema;
