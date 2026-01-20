import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/shared/db/schema",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL as string },
  verbose: true,
  strict: true
});
