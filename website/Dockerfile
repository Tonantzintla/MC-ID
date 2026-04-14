FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY . .
WORKDIR /app/website
RUN pnpm install --frozen-lockfile --ignore-scripts --lockfile-dir .. --ignore-workspace
RUN pnpm exec svelte-kit sync
RUN pnpm run build

FROM base AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app/website
COPY --from=build /app/website/build ./build
COPY --from=build /app/website/package.json ./package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/website/node_modules ./node_modules
COPY --from=build /app/website/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/website/drizzle ./drizzle
COPY --from=build /app/website/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
