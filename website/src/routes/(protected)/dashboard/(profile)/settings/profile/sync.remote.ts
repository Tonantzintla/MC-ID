import { getRequestEvent, query } from "$app/server";
import { minecraftKy } from "$lib/customKy";
import { auth } from "$lib/server/auth";
import { error } from "@sveltejs/kit";
import { HTTPError } from "ky";
import { z } from "zod/v4-mini";

export const syncUser = query(z.string(), async (uuid) => {
  const { request, locals } = getRequestEvent();
  try {
    const response = await minecraftKy(`minecraft/profile/lookup/${uuid}`);
    const userData = await response.json<{
      // https://minecraft.wiki/w/Mojang_API#Query_player's_username
      id: string; // UUID of the player
      name: string; // Name of the player, case sensitive.
      legacy?: boolean; // Included in response if the account has not migrated to Mojang account.
      demo?: boolean; // Included in response if the account does not own the game.
    }>();

    if (!response.ok) {
      console.error(`Failed to request code for UUID ${uuid}:`, userData);
      error(400, `Failed to request code for UUID ${uuid}`);
    }

    await auth.api.updateUser({
      headers: request.headers,
      body: {
        name: userData.name
      }
    });

    if (locals.user) locals.user.name = userData.name;

    return {
      success: true,
      data: userData,
      message: "User synced successfully"
    };
  } catch (err) {
    if (err instanceof HTTPError) {
      if (err.response.status === 404) {
        console.error(`Couldn't find any player with UUID ${uuid}`);
        error(404, `Couldn't find any player with the UUID ${uuid}`);
      }
      console.error(`HTTP error while syncing user with UUID ${uuid}:`, err);
      error(400, `Something went wrong while syncing user with UUID ${uuid}`);
    }
    console.error(`Error requesting code for UUID ${uuid}:`, err);
    error(500, `Internal server error while syncing user with UUID ${uuid}`);
  }
});

export const serverDate = query(() => {
  return {
    success: true,
    data: new Date().toISOString(),
    message: "Server date retrieved successfully"
  };
});
