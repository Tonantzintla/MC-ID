#!/bin/sh
set -eu

if [ "${SKIP_DB_MIGRATIONS:-false}" != "true" ]; then
  echo "Running database migrations..."
  pnpm dlx drizzle-kit migrate --config=drizzle.config.ts
fi

echo "Starting SvelteKit app..."
exec pnpm start
