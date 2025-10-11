import { getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import { error, redirect } from "@sveltejs/kit";
import { z } from "zod/v4-mini";

const consentSchema = z.object({
  accept: z.boolean(),
  consent_code: z.string()
});

export const consent = query(consentSchema, async ({ accept, consent_code }) => {
  const { locals, request } = getRequestEvent();
  const { headers } = request;
  if (!locals.user) error(401, "Unauthorized");
  let redirectURI: string;
  try {
    const response = await auth.api.oAuthConsent({
      headers,
      body: {
        accept,
        consent_code
      }
    });

    redirectURI = response.redirectURI;
  } catch (err) {
    console.error("OAuth Consent Error:", err);
    error(500, "Something went wrong during consent processing.");
  }
  redirect(303, redirectURI);
});
