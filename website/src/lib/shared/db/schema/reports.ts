import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { oauthClient, user } from "./auth-schema";

export const reportReasonEnum = pgEnum("report_reason", ["malicious", "misleading", "spam", "privacy_violation", "impersonation", "other"]);

export const reportStatusEnum = pgEnum("report_status", ["pending", "under_review", "resolved", "dismissed"]);

export const oauthClientReport = pgTable(
  "oauth_client_report",
  {
    id: text("id")
      .primaryKey()
      .$default(() => crypto.randomUUID()),

    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),

    reason: reportReasonEnum("reason").notNull(),
    description: text("description"),

    status: reportStatusEnum("status").default("pending").notNull(),
    resolvedAt: timestamp("resolved_at"),
    resolvedById: text("resolved_by_id").references(() => user.id, {
      onDelete: "set null"
    }),
    resolutionNote: text("resolution_note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [index("report_reporter_idx").on(table.reporterId), index("report_client_idx").on(table.clientId), index("report_status_idx").on(table.status)]
);
