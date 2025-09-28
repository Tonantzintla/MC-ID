import { relations } from "drizzle-orm";
import { apikey, user } from "./auth-schema";
import { verificationCodes } from "./codes";
import { mcuser } from "./mc-user";

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
