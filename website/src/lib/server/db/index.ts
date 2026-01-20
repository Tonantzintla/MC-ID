import { env } from "$env/dynamic/private";
import * as schema from "$lib/shared/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const { DATABASE_URL } = env;

const client = postgres(DATABASE_URL);

export const db = drizzle(client, { schema });
export type DB = typeof db;
