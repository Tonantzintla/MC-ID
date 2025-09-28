import { char, index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { apikey } from "./auth-schema";
import { mcuser } from "./mc-user";

export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: serial("id").primaryKey(), //User doesn't see this and its more efficient.
    code: char("code", { length: 6 }).notNull(),
    expiration: timestamp("expiration").notNull(),

    mcuserId: text("mcuser_id")
      .notNull()
      .references(() => mcuser.id),
    appApiKeyId: text("app_api_key_id")
      .notNull()
      .references(() => apikey.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => [index("mc_user_app_idx").on(table.appApiKeyId, table.mcuserId)]
);
