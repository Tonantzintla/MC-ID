FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN  corepack enable pnpm && pnpm i --frozen-lockfile

COPY . .

RUN pnpm drizzle-kit migrate && pnpm run build

EXPOSE 3000

CMD ["node", "dist/src/main"]