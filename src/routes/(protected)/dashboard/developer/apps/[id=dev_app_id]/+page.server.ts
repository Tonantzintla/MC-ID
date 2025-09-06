import { PUBLIC_BASE_URL } from "$env/static/public";
import { MCIDky } from "$lib/customKy";
import { error, fail, type Actions } from "@sveltejs/kit";
import ky from "ky";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { appSchema } from "../schema";
import type { DeveloperApp } from "../types";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
  try {
    const jwt = await ky(PUBLIC_BASE_URL + "/api/auth/token", {
      headers: event.request.headers
    }).json<{ token: string }>();

    if (!jwt?.token) {
      console.error("JWT token is missing");
      error(401, "Unauthorized: JWT token is missing");
    }

    const app = await MCIDky(`v1/apps/${event.params.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt.token}`
      }
    }).json<DeveloperApp>();

    return {
      appForm: await superValidate(zod(appSchema), {
        defaults: {
          name: app.name,
          website: app.website,
          description: app.description,
          id: app.id
        }
      }),
      appData: app
    };
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error during app editing:", err.message);
      error(500, err?.message ?? "Internal server error during app editing");
    } else {
      console.error("Unexpected error during app editing:", err);
      error(500, "Internal server error during app editing");
    }
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  editApp: async (event) => {
    const form = await superValidate(event, zod(appSchema));
    let _newApp: DeveloperApp;
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

      _newApp = await MCIDky.patch(`v1/apps/${event.params.id}`, {
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

      return {
        form
      };
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error during app editing:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error during app editing"
        });
      } else {
        console.error("Unexpected error during app editing:", err);
        return fail(500, {
          form,
          error: "Internal server error during app editing"
        });
      }
    }
  }
};
