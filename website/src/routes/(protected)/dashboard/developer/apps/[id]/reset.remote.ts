import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import { oauthApplication } from "$lib/server/db/schema";
import { hashOptions } from "$lib/server/hash-options";
import { generateRandomSecret } from "$lib/server/secret-generator";
import { hash as argon2Hash } from "@node-rs/argon2";
import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4-mini";

export const resetSecret = query(z.string(), async (appId) => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");
  try {
    const newSecret = generateRandomSecret();

    await db
      .update(oauthApplication)
      .set({
        clientSecret: await argon2Hash(newSecret, hashOptions)
      })
      .where(and(eq(oauthApplication.clientId, appId), eq(oauthApplication.userId, locals.user.id)));

    return {
      success: true,
      secret: newSecret
    };
  } catch (err) {
    console.error("Error during secret reset:", err);
    error(500, "Something went wrong trying to reset your app secret");
  }
});
