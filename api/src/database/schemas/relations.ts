import { relations } from 'drizzle-orm';
import { users } from './users';
import { verificationCodes } from './codes';
import { apps } from './apps';

export const usersRelations = relations(users, ({ many }) => ({
  verificationCodes: many(verificationCodes),
  apps: many(apps),
}));

export const appsRelations = relations(apps, ({ many, one }) => ({
  verificationCodes: many(verificationCodes),
  user: one(users, {
    fields: [apps.userId],
    references: [users.id],
  }),
}));

export const codeRelations = relations(verificationCodes, ({ one }) => ({
  user: one(users, {
    fields: [verificationCodes.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [verificationCodes.appId],
    references: [apps.id],
  }),
}));
