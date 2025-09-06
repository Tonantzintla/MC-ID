import { env } from "$env/dynamic/public";
import ky from "ky";

const { PUBLIC_API_URL } = env;

export const MCIDky = ky.create({
  prefixUrl: PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const minecraftKy = ky.create({
  prefixUrl: "https://api.minecraftservices.com"
});
