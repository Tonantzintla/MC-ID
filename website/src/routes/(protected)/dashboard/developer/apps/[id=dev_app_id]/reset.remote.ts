import { getRequestEvent, query } from "$app/server";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { MCIDky } from "$lib/customKy";
import { error } from "@sveltejs/kit";
import ky from "ky";
import { z } from "zod/v4-mini";

export const resetSecret = query(z.string(), async (appId) => {
  const { request } = getRequestEvent();
  try {
    const jwt = await ky(PUBLIC_BASE_URL + "/api/auth/token", {
      headers: request.headers
    }).json<{ token: string }>();

    if (!jwt?.token) {
      console.error("JWT token is missing");
      error(401, "Unauthorized: JWT token is missing");
    }

    const resData = await MCIDky.post(`v1/apps/${appId}/secret/reset`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt.token}`
      }
    }).json<{ secret: string }>();

    if (!resData?.secret) {
      console.error("Reset secret response is missing");
      error(500, "Internal server error: Reset secret response is missing");
    }

    return {
      success: true,
      secret: resData.secret
    };
  } catch (err) {
    console.error("Error during reset secret fetch:", err);
    error(500, "Internal server error during reset secret fetch");
  }
});
