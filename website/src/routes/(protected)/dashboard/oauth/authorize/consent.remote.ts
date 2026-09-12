import { command, getRequestEvent } from "$app/server";
import { auth } from "$lib/server/auth";
import { error } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { z } from "zod/v4-mini";

const consentSchema = z.object({
  accept: z.boolean(),
  scopes: z.optional(z.array(z.string())),
  oauth_query: z.string() // The original OAuth query string with signature
});

export const consent = command(consentSchema, async ({ accept, scopes, oauth_query }) => {
  const { locals, request } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");
  let redirectURI: string;
  try {
    const response = await auth.api.oauth2Consent({
      request,
      asResponse: false,
      headers: request.headers,
      body: {
        accept,
        scope: scopes?.join(" "),
        oauth_query
      }
    });

    redirectURI = response.url;
  } catch (err) {
    if (err instanceof APIError && err.statusCode >= 400 && err.statusCode < 500) {
      error(
        err.statusCode,
        "This authorization request is invalid or has expired. Please restart authorization from the app."
      );
    }
    console.error("OAuth Consent Error:", err);
    error(500, "Something went wrong during consent processing.");
  }
  return {
    redirect: redirectURI,
    status: 307
  };
});
