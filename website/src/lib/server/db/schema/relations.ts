import { relations } from "drizzle-orm";
import { oauthApplication, user } from "./auth-schema";
import { verificationCodes } from "./codes";
import { mcuser } from "./mc-user";

export const mcUsersRelations = relations(mcuser, ({ many }) => ({
  verificationCodes: many(verificationCodes)
}));

export const appsRelations = relations(oauthApplication, ({ many, one }) => ({
  verificationCodes: many(verificationCodes),
  user: one(user, {
    fields: [oauthApplication.userId],
    references: [user.id]
  })
}));

export const codeRelations = relations(verificationCodes, ({ one }) => ({
  user: one(mcuser, {
    fields: [verificationCodes.mcuserId],
    references: [mcuser.id]
  }),
  app: one(oauthApplication, {
    fields: [verificationCodes.appClientId],
    references: [oauthApplication.clientId]
  })
}));
