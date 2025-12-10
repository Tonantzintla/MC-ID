FROM node:24-alpine AS base

WORKDIR /app
RUN npm install -g pnpm

# --- Dependency Stage ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build Stage ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG BETTER_AUTH_SECRET
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
RUN pnpm svelte-kit sync
RUN pnpm build

# --- Production Stage ---
FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/drizzle ./drizzle

EXPOSE 3000
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]