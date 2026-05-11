#!/bin/sh
set -eu

# Call binaries directly to avoid pnpm 11.x's verify-deps-before-run check,
# which sees the runtime context as "out of sync" with the install-time
# .modules.yaml metadata and tries to re-install — failing without a TTY.
if [ "${SKIP_DB_MIGRATIONS:-false}" != "true" ]; then
  echo "Running database migrations..."
  /app/node_modules/.bin/drizzle-kit migrate --config=drizzle.config.ts
fi

echo "Starting SvelteKit app..."
exec node build
