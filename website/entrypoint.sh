#!/bin/sh
set -eu

if [ "${SKIP_DB_MIGRATIONS:-false}" != "true" ]; then
  echo "Running database migrations..."
  pnpm dlx --package=drizzle-kit --package=drizzle-orm --package=postgres drizzle-kit migrate --config=drizzle.config.ts
fi

echo "Starting SvelteKit app..."
exec pnpm start
