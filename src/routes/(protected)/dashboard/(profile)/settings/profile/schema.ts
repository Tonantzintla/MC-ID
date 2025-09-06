import { z } from "zod";

const name = z.string();
const email = z.email("The email must be a valid email address");
const currentPassword = z.string().min(8, "Passwords are at least 8 characters long");

export const profileUpdateSchema = z.object({
  uuid: z.string().optional(),
  name: name.optional(),
  email
});
export const accountDeletionSchema = z
  .object({
    ["current-password"]: currentPassword,
    confirm: z.string().refine((value) => value === "DELETE", {
      message: "You must type 'DELETE' to confirm account deletion"
    })
  })
  .refine((data) => data["current-password"], {
    message: "You must provide your current password to delete your account"
  });

export type ProfileUpdateSchema = typeof profileUpdateSchema;
export type AccountDeletionSchema = typeof accountDeletionSchema;
