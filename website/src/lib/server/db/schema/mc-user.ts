import { char, pgTable, timestamp } from "drizzle-orm/pg-core";

export const mcuser = pgTable("mcuser", {
  id: char("mcid", { length: 32 }).notNull().primaryKey().unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
