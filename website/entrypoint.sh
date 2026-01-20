#!/bin/sh

echo "Running database migrations..."
pnpm run db:migrate

echo "Starting SvelteKit app..."
exec node build