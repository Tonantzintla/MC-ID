import { getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import { error, redirect } from "@sveltejs/kit";
import { z } from "zod/v4-mini";

const consentSchema = z.object({
  accept: z.boolean(),
  scope: z.optional(z.string()),
  oauth_query: z.string() // The original OAuth query string with signature
});

export const consent = query(consentSchema, async ({ accept, scope, oauth_query }) => {
  const { locals, request } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");
  let redirectURI: string;
  try {
    const response = await auth.api.oauth2Consent({
      headers: request.headers,
      request,
      body: {
        accept,
        scope,
        oauth_query
      }
    });

    redirectURI = response.uri;
  } catch (err) {
    console.error("OAuth Consent Error:", err);
    error(500, "Something went wrong during consent processing.");
  }
  redirect(303, redirectURI);
});
