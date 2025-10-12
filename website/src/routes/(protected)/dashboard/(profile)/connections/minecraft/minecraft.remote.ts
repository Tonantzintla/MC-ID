import { command, getRequestEvent, query } from "$app/server";
import { MCIDky, minecraftKy } from "$lib/customKy";
import { db } from "$lib/server/db";
import { minecraftAccount } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { HTTPError } from "ky";
import { z } from "zod";
import { username as usernameSchema } from "./schema";

const requestCodeSchema = z.object({
  username: usernameSchema
});

export const minecraftAccounts = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");

  try {
    const accounts = await db.query.minecraftAccount.findMany({
      where: eq(minecraftAccount.userId, locals.user.id),
      orderBy: (mc, { desc }) => [desc(mc.createdAt)]
    });

    return accounts;
  } catch (err) {
    console.error("Error fetching Minecraft accounts:", err);
    error(500, "Internal server error while fetching Minecraft accounts");
  }
});

export const requestCode = command(requestCodeSchema, async ({ username }) => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");
  try {
    const userData = await minecraftKy(`minecraft/profile/lookup/name/${username}`).json<{
      // https://minecraft.wiki/w/Mojang_API#Query_player's_UUID
      id: string; // UUID of the player
      name: string; // Name of the player, case sensitive.
      legacy?: boolean; // Included in response if the account has not migrated to Mojang account.
      demo?: boolean; // Included in response if the account does not own the game.
    }>();

    const existingAccount = await db.query.minecraftAccount.findFirst({
      where: eq(minecraftAccount.uuid, userData.id)
    });

    if (existingAccount) {
      return {
        success: false,
        message: `An account with the username ${username} is already linked.`
      };
    }

    const response = await MCIDky.post("v1/codes/request", {
      body: JSON.stringify({
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

export const unlinkAccount = command(z.object({ uuid: z.string() }), async ({ uuid }) => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");

  try {
    // Check if the account exists and is primary
    const account = await db.query.minecraftAccount.findFirst({
      where: and(eq(minecraftAccount.uuid, uuid), eq(minecraftAccount.userId, locals.user.id))
    });

    if (!account) {
      error(404, "Minecraft account not found or does not belong to the user");
    }

    if (account.primary) {
      return {
        success: false,
        message: "Cannot delete primary Minecraft account. Please set another account as primary first.",
        status: 400
      };
    }

    const deleteCount = await db
      .delete(minecraftAccount)
      .where(and(eq(minecraftAccount.uuid, uuid), eq(minecraftAccount.userId, locals.user.id)))
      .returning();

    if (deleteCount.length === 0) {
      error(404, "Minecraft account not found or does not belong to the user");
    }

    minecraftAccounts().refresh();

    return {
      success: true,
      message: "Minecraft account unlinked successfully"
    };
  } catch (err) {
    console.error("Error unlinking Minecraft account:", err);
    error(500, "Internal server error while unlinking Minecraft account");
  }
});

export const makePrimary = command(z.object({ uuid: z.string() }), async ({ uuid }) => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");

  try {
    const account = await db.query.minecraftAccount.findFirst({
      where: and(eq(minecraftAccount.uuid, uuid), eq(minecraftAccount.userId, locals.user.id))
    });

    if (!account) {
      error(404, "Minecraft account not found or does not belong to the user");
    }

    await db.update(minecraftAccount).set({ primary: false }).where(eq(minecraftAccount.userId, locals.user.id));

    await db
      .update(minecraftAccount)
      .set({ primary: true })
      .where(and(eq(minecraftAccount.uuid, uuid), eq(minecraftAccount.userId, locals.user.id)));

    minecraftAccounts().refresh();

    return {
      success: true,
      message: "Minecraft account set as primary successfully"
    };
  } catch (err) {
    console.error("Error setting Minecraft account as primary:", err);
    error(500, "Internal server error while setting Minecraft account as primary");
  }
});
