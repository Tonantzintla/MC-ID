#!/bin/sh

echo "Running database migrations..."
npm run db:migrate

echo "Starting SvelteKit app..."
exec node build