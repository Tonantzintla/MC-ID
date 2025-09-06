import { getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import { error } from "@sveltejs/kit";
import { z } from "zod/v4-mini";

export const getPasskeys = query(async () => {
  const { request } = getRequestEvent();
  try {
    const passkeys = await auth.api.listPasskeys({
      // This endpoint requires session cookies.
      headers: request.headers
    });

    if (!passkeys || !Array.isArray(passkeys)) {
      error(404, "No passkeys found");
    }

    return passkeys;
  } catch (err) {
    console.error("Error requesting passkeys", err);
    error(500, "Failed to retrieve passkeys");
  }
});

const updatePasskeySchema = z.object({ id: z.string(), name: z.optional(z.string()) });

export const updatePasskey = query(updatePasskeySchema, async (newData) => {
  const { request } = getRequestEvent();
  try {
    const data = await auth.api.updatePasskey({
      body: {
        id: newData.id,
        name: newData.name ?? "Unnamed Passkey"
      },
      // This endpoint requires session cookies.
      headers: request.headers
    });

    if (!data.passkey) {
      error(404, "Passkey not found");
    }

    return data.passkey;
  } catch (err) {
    console.error("Error updating passkey", err);
    error(500, "Failed to update passkey");
  }
});

export const deletePasskey = query(z.string(), async (id) => {
  const { request } = getRequestEvent();
  try {
    await auth.api.deletePasskey({
      body: {
        id
      },
      // This endpoint requires session cookies.
      headers: request.headers
    });

    return { success: true, message: "Passkey deleted successfully" };
  } catch (err) {
    console.error("Error deleting passkey", err);
    error(500, "Failed to delete passkey");
  }
});
