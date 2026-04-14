#!/bin/sh
set -eu

if [ "${SKIP_DB_MIGRATIONS:-false}" != "true" ]; then
  echo "Running database migrations..."
  npm run db:migrate
fi

echo "Starting SvelteKit app..."
exec node build