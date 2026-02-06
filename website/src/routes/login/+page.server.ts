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

      const _signupData = await auth.api.signUpEmail({
        body: {
          name: "",
          email: form.data.email,
          password: form.data["new-password"],
          rememberMe: true,
          callbackURL: "/dashboard"
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
