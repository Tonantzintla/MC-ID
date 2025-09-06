import { PUBLIC_BASE_URL } from "$env/static/public";
import { MCIDky } from "$lib/customKy";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import ky from "ky";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { appSchema } from "./schema";
import type { DeveloperApp } from "./types";

export const load = (async (event) => {
  try {
    const jwt = await ky(PUBLIC_BASE_URL + "/api/auth/token", {
      headers: event.request.headers
    }).json<{ token: string }>();

    if (!jwt?.token) {
      console.error("JWT token is missing");
      error(401, "Unauthorized: JWT token is missing");
    }

    const apps = await MCIDky("v1/apps", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt.token}`
      }
    }).json<DeveloperApp[]>();

    return {
      appForm: await superValidate(zod(appSchema)),
      appsData: apps
    };
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error during apps data fetch:", err.message);
      error(500, err?.message ?? "Internal server error during app data fetch");
    } else {
      console.error("Unexpected error during apps data fetch:", err);
      error(500, "Internal server error during app data fetch");
    }
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  createApp: async (event) => {
    const form = await superValidate(event, zod(appSchema));
    let newApp: DeveloperApp;
    try {
      const jwt = await ky(PUBLIC_BASE_URL + "/api/auth/token", {
        headers: event.request.headers
      }).json<{ token: string }>();

      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      if (!jwt?.token) {
        console.error("JWT token is missing");
        return fail(401, {
          form,
          error: "Unauthorized: JWT token is missing"
        });
      }

      newApp = await MCIDky.post("v1/apps", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt.token}`
        },
        body: JSON.stringify({
          name: form.data.name,
          website: form.data.website,
          description: form.data.description
        })
      }).json<DeveloperApp>();
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error during app creation:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error during app creation"
        });
      } else {
        console.error("Unexpected error during app creation:", err);
        return fail(500, {
          form,
          error: "Internal server error during app creation"
        });
      }
    }

    redirect(307, `/dashboard/developer/apps/${newApp.id}`);
  }
};
