import { char, index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { oauthApplication } from "./auth-schema";
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
    // Changed to reference clientId directly instead of primary key id
    appClientId: text("app_client_id")
      .notNull()
      .references(() => oauthApplication.clientId),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => [index("mc_user_app_idx").on(table.appClientId, table.mcuserId)]
);
