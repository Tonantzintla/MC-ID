import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import ky from "ky";

const { PUBLIC_API_URL } = publicEnv;
const { MCID_API_KEY } = privateEnv;

export const MCIDky = ky.create({
  prefixUrl: PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": MCID_API_KEY
  }
});

export const minecraftKy = ky.create({
  prefixUrl: "https://api.minecraftservices.com"
});
