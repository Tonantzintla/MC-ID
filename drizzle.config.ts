import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schemas/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URI!,
  },
} satisfies Config;
