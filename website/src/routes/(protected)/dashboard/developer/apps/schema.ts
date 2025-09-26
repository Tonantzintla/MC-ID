import { Scope } from "$lib/scopes";
import { z } from "zod";

const name = z.string().min(3, "The name must be at least 3 characters long").max(32, "The name must be at most 32 characters long");
const uri = z.url("The website must be a valid URI").min(3);
const description = z.string().min(10, "The description must be at least 10 characters long").max(500, "The description must be at most 500 characters long");
const id = z.string().optional();
const redirectUris = z.array(z.string().url("Each redirect URI must be a valid URL")).min(1, "At least one redirect URI is required");
const requiredScopes: Scope[] = [Scope.PROFILE];
const scopes = z.array(z.enum([Scope.PROFILE, Scope.EMAIL, Scope.CONNECTIONS])).refine(
  (check) => {
    // Ensure all required scopes are included
    return requiredScopes.every((scope) => check.includes(scope));
  },
  {
    message: `The following scopes are required: ${requiredScopes.join(", ")}`
  }
);
const contacts = z.array(z.email("Each contact must be a valid email address")).min(1, "At least one contact email is required");
const tosUri = z.url("The Terms of Service URI must be a valid URI").optional();
const policyUri = z.url("The Privacy Policy URI must be a valid URI").optional();

export const appSchema = z.object({
  name,
  uri,
  description,
  id,
  redirectUris,
  scopes,
  contacts,
  tosUri,
  policyUri
});

export const deleteAppSchema = z.object({
  id
});

export type AppSchema = typeof appSchema;
export type DeleteAppSchema = typeof deleteAppSchema;

export { requiredScopes };
