import { auth } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { loginFormSchema, signupFormSchema } from "./schema";

export const load = (async () => {
  return {
    loginForm: await superValidate(zod(loginFormSchema)),
    signupForm: await superValidate(zod(signupFormSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  login: async (event) => {
    const form = await superValidate(event, zod(loginFormSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const data = await auth.api.signInEmail({
        body: {
          email: form.data.email, // required
          password: form.data["current-password"], // required
          rememberMe: true,
          callbackURL: "/"
        }
      });

      if (!data) {
        console.error("Login failed: Invalid credentials");
        return fail(400, {
          form,
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error during login:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error during login"
        });
      } else {
        console.error("Unexpected error during login:", err);
        return fail(500, {
          form,
          error: "Internal server error during login"
        });
      }
    }

    redirect(307, "/dashboard");
  },

  signup: async (event) => {
    const form = await superValidate(event, zod(signupFormSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      // const userData = await minecraftKy(`minecraft/profile/lookup/name/${form.data.mcusername}`).json<{
      //   // https://minecraft.wiki/w/Mojang_API#Query_player's_UUID
      //   id: string; // UUID of the player
      //   name: string; // Name of the player, case sensitive.
      //   legacy?: boolean; // Included in response if the account has not migrated to Mojang account.
      //   demo?: boolean; // Included in response if the account does not own the game.
      // }>();

      // const data = await MCIDky.post("v1/codes/verify", {
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     appId: APP_ID,
      //     appSecret: APP_SECRET,
      //     uuid: userData.id,
      //     code: form.data.code
      //   })
      // }).json<{
      //   id: string;
      //   username: string;
      // }>();

      // if (!data) {
      //   console.error("Failed to verify code for signup");
      //   return fail(400, {
      //     form,
      //     error: "Failed to verify code for signup"
      //   });
      // }

      // if (data.id !== userData.id || data.username !== userData.name) {
      //   console.error("User data mismatch during signup verification");
      //   return fail(400, {
      //     form,
      //     error: "User data mismatch during signup verification"
      //   });
      // }

      const _signupData = await auth.api.signUpEmail({
        body: {
          name: "",
          email: form.data.email,
          password: form.data["new-password"],
          rememberMe: true,
          callbackURL: "/"
        }
      });
    } catch (err) {
      console.error("Error during signup:", err);
      return fail(500, {
        form,
        error: "Internal server error during signup"
      });
    }

    // dashboard redirect
    redirect(307, "/dashboard");
  }
};
