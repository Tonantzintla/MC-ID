import { command, getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import { error } from "@sveltejs/kit";
import { z } from "zod/v4-mini";

export const getConsentedApps = query(async () => {
  const { request } = getRequestEvent();

  try {
    const consents = await auth.api.getOAuthConsents({
      // This endpoint requires session cookies.
      headers: request.headers
    });

    // We need to fetch app details for each consented app
    const apps = await Promise.all(
      consents.map(async (consent) => {
        const appDetails = await auth.api.getOAuthClientPublic({
          query: {
            client_id: consent.clientId // required
          },
          // This endpoint requires session cookies.
          headers: request.headers
        });
        return {
          consent,
          publicApp: appDetails
        };
      })
    );

    if (!apps || !Array.isArray(apps)) {
      error(404, "No consented apps found");
    }

    return apps;
  } catch (err) {
    console.error("Error retrieving consented apps", err);
    error(500, "Failed to retrieve consented apps");
  }
});

export const deleteConsent = command(z.string(), async (consentId) => {
  const { request } = getRequestEvent();
  try {
    await auth.api.deleteOAuthConsent({
      body: {
        id: consentId // required
      },
      // This endpoint requires session cookies.
      headers: request.headers
    });

    await getConsentedApps().refresh();

    return { success: true, message: "Consent deleted successfully" };
  } catch (err) {
    console.error("Error deleting consent", err);
    error(500, "Failed to delete consent");
  }
});
