import { getOAuthQuery } from "$lib/oauth-query";
import { auth } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
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
    let destination: string;
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const response = await auth.api.signInEmail({
        request: event.request,
        headers: event.request.headers,
        asResponse: true,
        body: {
          ...{ oauth_query: getOAuthQuery(event.url.searchParams) },
          email: form.data.email, // required
          password: form.data["current-password"], // required
          rememberMe: true,
          callbackURL: "/"
        }
      });

      if (!response.ok && !response.headers.has("location")) {
        return fail(response.status, { form, error: "Unable to log in. Check your credentials and try again." });
      }
      const result = response.headers.has("location") ? null : await response.json();
      destination = response.headers.get("location") ?? (result?.redirect && result.url ? result.url : "/dashboard");
    } catch (err) {
      if (err instanceof APIError) {
        return fail(err.statusCode, { form, error: "Unable to log in. Check your credentials and try again." });
      }
      console.error("Error during login:", err);
      return fail(500, { form, error: "Internal server error during login" });
    }

    redirect(303, destination);
  },

  signup: async (event) => {
    const form = await superValidate(event, zod(signupFormSchema));
    let destination: string;
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const response = await auth.api.signUpEmail({
        request: event.request,
        headers: event.request.headers,
        asResponse: true,
        body: {
          ...{ oauth_query: getOAuthQuery(event.url.searchParams) },
          name: "",
          email: form.data.email,
          password: form.data["new-password"],
          rememberMe: true,
          callbackURL: "/dashboard"
        }
      });
      if (!response.ok && !response.headers.has("location")) {
        return fail(response.status, { form, error: "Unable to create your account. Please try again." });
      }
      const result = response.headers.has("location") ? null : await response.json();
      destination = response.headers.get("location") ?? (result?.redirect && result.url ? result.url : "/dashboard");
    } catch (err) {
      console.error("Error during signup:", err);
      return fail(500, {
        form,
        error: "Internal server error during signup"
      });
    }

    // dashboard redirect
    redirect(303, destination);
  }
};
