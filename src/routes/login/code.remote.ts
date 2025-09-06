import { query } from "$app/server";
import { env } from "$env/dynamic/private";
import { MCIDky, minecraftKy } from "$lib/customKy";
import { error } from "@sveltejs/kit";
import { HTTPError } from "ky";
import { username } from "./schema";

const { APP_ID, APP_SECRET } = env;

export const requestCode = query(username, async (username) => {
  try {
    const userData = await minecraftKy(`minecraft/profile/lookup/name/${username}`).json<{
      // https://minecraft.wiki/w/Mojang_API#Query_player's_UUID
      id: string; // UUID of the player
      name: string; // Name of the player, case sensitive.
      legacy?: boolean; // Included in response if the account has not migrated to Mojang account.
      demo?: boolean; // Included in response if the account does not own the game.
    }>();

    const response = await MCIDky.post("v1/codes/request", {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        appId: APP_ID,
        appSecret: APP_SECRET,
        uuid: userData.id
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to request code for username ${username}:`, errorData);
      error(400, `Failed to request code for username ${username}`);
    }

    return {
      success: true,
      message: `Code requested successfully for username ${username}`
    };
  } catch (err) {
    if (err instanceof HTTPError) {
      if (err.response.status === 404) {
        console.error(`Couldn't find any player with name ${username}`);
        error(404, `Couldn't find any player with the name ${username}`);
      }
      console.error(`HTTP error requesting code for username ${username}:`, err);
      error(400, `Something went wrong while requesting code for the username ${username}`);
    }
    console.error(`Error requesting code for username ${username}:`, err);
    error(500, `Internal server error while requesting code for the username ${username}`);
  }
});
