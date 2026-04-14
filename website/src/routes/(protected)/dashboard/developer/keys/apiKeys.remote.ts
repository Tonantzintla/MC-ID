import { command, getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import { error } from "@sveltejs/kit";
import { z } from "zod/v4-mini";

export const getApiKeys = query(async () => {
  const { request } = getRequestEvent();
  try {
    const result = await auth.api.listApiKeys({
      // This endpoint requires session cookies.
      headers: request.headers
    });

    if (!result || !Array.isArray(result.apiKeys)) {
      error(404, "No API keys found");
    }

    return result.apiKeys;
  } catch (err) {
    console.error("Error requesting API keys", err);
    error(500, "Failed to retrieve API keys");
  }
});

export const deleteApiKey = command(z.string(), async (id) => {
  const { request } = getRequestEvent();
  try {
    await auth.api.deleteApiKey({
      body: {
        keyId: id
      },
      // This endpoint requires session cookies.
      headers: request.headers
    });

    return { success: true, message: "API key deleted successfully" };
  } catch (err) {
    console.error("Error deleting API key", err);
    error(500, "Failed to delete API key");
  }
});
