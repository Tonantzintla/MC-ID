import { building } from "$app/environment";
import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const { DATABASE_URL } = env;

if (!DATABASE_URL && !building) throw new Error("DATABASE_URL is not set");

const client = postgres(DATABASE_URL);

export const db = drizzle(client, { schema });
export type DB = typeof db;
