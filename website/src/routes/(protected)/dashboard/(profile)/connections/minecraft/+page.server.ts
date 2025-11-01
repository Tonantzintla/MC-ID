import { MCIDky, minecraftKy } from "$lib/customKy";
import { db } from "$lib/server/db";
import { minecraftAccount } from "$lib/server/db/schema";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { HTTPError } from "ky";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { verifyCodeFormSchema } from "./schema";

export const load = (async () => {
  return {
    verifyCodeForm: await superValidate(zod(verifyCodeFormSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  verifyCode: async (event) => {
    const { locals } = event;
    const form = await superValidate(event, zod(verifyCodeFormSchema));
    if (!form.valid) {
      console.error("Form invalid:", form.errors);
      return fail(400, {
        form
      });
    }

    const { code, username } = form.data;

    try {
      const userData = await minecraftKy(`minecraft/profile/lookup/name/${username}`).json<{
        // https://minecraft.wiki/w/Mojang_API#Query_player's_UUID
        id: string; // UUID of the player
        name: string; // Name of the player, case sensitive.
        legacy?: boolean; // Included in response if the account has not migrated to Mojang account.
        demo?: boolean; // Included in response if the account does not own the game.
      }>();

      const response = await MCIDky.post("v1/codes/verify", {
        body: JSON.stringify({
          uuid: userData.id,
          code
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to verify code for username ${username}:`, errorData);

        return fail(400, {
          form,
          error: `Failed to verify code for username ${username}`
        });
      }

      await saveMinecraftAccount(locals.user!.id, userData.id, userData.name);

      return {
        success: true,
        form
      };
    } catch (err) {
      if (err instanceof HTTPError) {
        if (err.response.status === 404) {
          console.error(`Couldn't find any player with name ${username}`);
          return fail(404, {
            form,
            error: `Couldn't find any player with the name ${username}`
          });
        }
        console.error(`HTTP error requesting code for username ${username}:`, err);
        return fail(400, {
          form,
          error: `Something went wrong while requesting code for the username ${username}`
        });
      }
      console.error(`Error requesting code for username ${username}:`, err);
      return fail(500, {
        form,
        error: `Internal server error while requesting code for the username ${username}`
      });
    }
  }
};

async function saveMinecraftAccount(userId: string, uuid: string, username: string) {
  const hasPrimary = await db.$count(minecraftAccount, and(eq(minecraftAccount.userId, userId), eq(minecraftAccount.primary, true)));

  await db.insert(minecraftAccount).values({
    userId,
    uuid,
    username,
    primary: hasPrimary === 0
  });
  console.info("Inserted account:");
}
