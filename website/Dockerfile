FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY website/package.json ./website/package.json
RUN pnpm --dir website install --frozen-lockfile --ignore-scripts

FROM base AS build
WORKDIR /app
COPY --from=deps /app/website/node_modules ./website/node_modules
COPY . .
WORKDIR /app/website
RUN pnpm svelte-kit sync
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app/website
COPY --from=build /app/website/build ./build
COPY --from=build /app/website/package.json ./package.json
COPY --from=build /app/website/node_modules ./node_modules
COPY --from=build /app/website/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/website/drizzle ./drizzle
COPY --from=build /app/website/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
