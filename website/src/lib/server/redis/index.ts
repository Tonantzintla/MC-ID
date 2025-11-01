import { env } from "$env/dynamic/private";
import { createClient } from "redis";

const { REDIS_URL } = env;

const redis = createClient({
  url: REDIS_URL
});

redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();

export { redis };
