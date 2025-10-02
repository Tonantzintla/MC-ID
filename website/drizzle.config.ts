import { building } from "$app/environment";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL && !building) throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "./src/lib/server/db/schema",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  verbose: true,
  strict: true
});
