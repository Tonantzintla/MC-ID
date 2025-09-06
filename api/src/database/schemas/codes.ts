import {
  char,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { apps } from './apps';

export const verificationCodes = pgTable(
  'verification_codes',
  {
    id: serial('id').primaryKey(), //User doesn't see this and its more efficient.
    code: char('code', { length: 6 }).notNull(),
    expiration: timestamp('expiration').notNull(),

    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    appId: text('app_id')
      .notNull()
      .references(() => apps.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    appUserIdx: uniqueIndex('app_user_idx').on(table.appId, table.userId),
  }),
);
