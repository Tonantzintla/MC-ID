import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createId } from '@paralleldrive/cuid2';

export const apps = pgTable('apps', {
  id: text('cuid')
    .primaryKey()
    .$defaultFn(() => createId()),
  secret: text('secret').notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  website: varchar('website', { length: 512 }).notNull(),
  description: varchar('description', { length: 512 }),

  userId: text('user_id').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
