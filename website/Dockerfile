FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY . .
WORKDIR /app/website
RUN pnpm install --frozen-lockfile --ignore-scripts --lockfile-dir .. --ignore-workspace --config.node-linker=hoisted
# Call binaries directly to avoid pnpm 11.x's verify-deps-before-run check,
# which triggers an interactive node_modules purge that aborts in Docker (no TTY).
RUN ../node_modules/.bin/svelte-kit sync
RUN ../node_modules/.bin/vite build

FROM base AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app/website
COPY --from=build /app/website/build ./build
COPY --from=build /app/website/package.json ./package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/website/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/website/drizzle ./drizzle
COPY --from=build /app/website/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
