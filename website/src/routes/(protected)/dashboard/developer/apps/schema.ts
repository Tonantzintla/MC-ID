import { Scope } from "$lib/scopes";
import { z } from "zod";

const optionalHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => !value || (URL.canParse(value) && ["https:", "http:"].includes(new URL(value).protocol)),
    "Use an absolute HTTP or HTTPS URL"
  )
  .optional();

const name = z
  .string()
  .min(3, "The name must be at least 3 characters long")
  .max(32, "The name must be at most 32 characters long");
const uri = optionalHttpUrl;
const description = z
  .string()
  .min(10, "The description must be at least 10 characters long")
  .max(500, "The description must be at most 500 characters long");
const id = z.string();
const redirectUris = z
  .array(z.url("Each redirect URI must be a valid URL"))
  .min(1, "At least one redirect URI is required");
const scopes = z.array(z.enum(Scope)).min(1, "Select at least one scope").default([Scope.OPENID, Scope.PROFILE]);

function isPublicJwks(value: string) {
  if (!value.trim()) return true;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed.keys) || parsed.keys.length === 0) return false;
    return parsed.keys.every(
      (key: Record<string, unknown>) =>
        key &&
        ["RSA", "EC", "OKP"].includes(String(key.kty)) &&
        !["d", "p", "q", "dp", "dq", "qi", "oth", "k"].some((field) => field in key)
    );
  } catch {
    return false;
  }
}

const contacts = z
  .array(z.email("Each contact must be a valid email address"))
  .min(1, "At least one contact email is required");
const tosUri = optionalHttpUrl;
const policyUri = optionalHttpUrl;
const logoUrl = optionalHttpUrl;

export const appSchema = z
  .object({
    name,
    uri,
    description,
    id,
    redirectUris,
    scopes,
    contacts,
    tosUri,
    policyUri,
    logoUrl,
    applicationType: z.enum(["web", "native"]).default("web"),
    tokenEndpointAuthMethod: z
      .enum(["client_secret_basic", "client_secret_post", "none", "private_key_jwt"])
      .default("client_secret_basic"),
    grantTypes: z
      .array(z.enum(["authorization_code", "refresh_token"]))
      .refine((values) => values.includes("authorization_code"), "Authorization code is required")
      .default(["authorization_code"]),
    jwks: z
      .string()
      .max(32768)
      .refine(isPublicJwks, "Enter a JWKS containing public RSA, EC, or OKP keys only")
      .default(""),
    jwksUri: optionalHttpUrl,
    postLogoutRedirectUris: z.array(z.url("Enter a valid post-logout redirect URI")).default([]),
    backchannelLogoutUri: optionalHttpUrl,
    backchannelLogoutSessionRequired: z.boolean().default(false),
    softwareId: z.string().trim().max(255).optional(),
    softwareVersion: z.string().trim().max(255).optional(),
    dpopBoundAccessTokens: z.boolean().default(false)
  })
  .superRefine((data, ctx) => {
    if (data.scopes.includes(Scope.OFFLINE_ACCESS) && !data.grantTypes.includes("refresh_token")) {
      ctx.addIssue({
        code: "custom",
        path: ["grantTypes"],
        message: "Offline access requires the refresh token grant"
      });
    }
    if (data.tokenEndpointAuthMethod === "private_key_jwt") {
      if (Boolean(data.jwks.trim()) === Boolean(data.jwksUri)) {
        ctx.addIssue({ code: "custom", path: ["jwks"], message: "Provide either public JWKS or a JWKS URL, not both" });
      }
    } else if (data.jwks.trim() || data.jwksUri) {
      ctx.addIssue({ code: "custom", path: ["jwks"], message: "Signing keys require private_key_jwt authentication" });
    }
    if (data.jwksUri && URL.canParse(data.jwksUri) && new URL(data.jwksUri).protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        path: ["jwksUri"],
        message: "JWKS URLs must use HTTPS and a server-trusted origin"
      });
    }
    if (data.backchannelLogoutSessionRequired && !data.backchannelLogoutUri) {
      ctx.addIssue({
        code: "custom",
        path: ["backchannelLogoutUri"],
        message: "A back-channel logout URL is required"
      });
    }
  })
  .refine(
    (data) => {
      if (!data.uri || !data.logoUrl) return true;
      try {
        const websiteUrl = new URL(data.uri);
        const logoUrl = new URL(data.logoUrl);
        return websiteUrl.origin === logoUrl.origin;
      } catch {
        return false;
      }
    },
    {
      message: "The logo URL must have the same origin as the website URI",
      path: ["logoUrl"]
    }
  );
export const deleteAppSchema = z.object({
  id
});

export type AppSchema = typeof appSchema;
export type DeleteAppSchema = typeof deleteAppSchema;
