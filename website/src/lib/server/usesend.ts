import { building, dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { UseSend } from "usesend-js";

const { USESEND_API_KEY, USESEND_BASE_URL } = env;

if (dev || building) {
  if (!USESEND_API_KEY) throw new Error("USESEND_API_KEY is not set");
  if (!USESEND_BASE_URL) throw new Error("USESEND_BASE_URL is not set");
}

export const usesend = new UseSend(USESEND_API_KEY, USESEND_BASE_URL);
