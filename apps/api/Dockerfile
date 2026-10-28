FROM oven/bun:1.4.4 AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/domain/package.json packages/domain/package.json
RUN bun install --frozen-lockfile

COPY apps/api apps/api
COPY packages packages
RUN bun run --cwd apps/api build

FROM oven/bun:1.4.4

WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist

EXPOSE 8000

CMD ["bun", "dist/server.js"]
