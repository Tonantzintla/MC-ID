import { relations } from "drizzle-orm";
import { apikey, oauthClient, user } from "./auth-schema";
import { verificationCodes } from "./codes";
import { mcuser } from "./mc-user";
import { oauthClientReport } from "./reports";

export const mcUsersRelations = relations(mcuser, ({ many }) => ({
  verificationCodes: many(verificationCodes)
}));

export const appsRelations = relations(apikey, ({ many, one }) => ({
  verificationCodes: many(verificationCodes),
  user: one(user, {
    fields: [apikey.userId],
    references: [user.id]
  })
}));

export const codeRelations = relations(verificationCodes, ({ one }) => ({
  user: one(mcuser, {
    fields: [verificationCodes.mcuserId],
    references: [mcuser.id]
  }),
  apiKey: one(apikey, {
    fields: [verificationCodes.appApiKeyId],
    references: [apikey.id]
  })
}));

export const oauthClientReportRelations = relations(oauthClientReport, ({ one }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthClientReport.clientId],
    references: [oauthClient.clientId],
    relationName: "oauthClientReport_client"
  }),
  reporter: one(user, {
    fields: [oauthClientReport.reporterId],
    references: [user.id],
    relationName: "oauthClientReport_reporter"
  }),
  client: one(oauthClient, {
    fields: [oauthClientReport.clientId],
    references: [oauthClient.clientId]
  }),
  resolvedBy: one(user, {
    fields: [oauthClientReport.resolvedById],
    references: [user.id],
    relationName: "oauthClientReport_resolver"
  })
}));
