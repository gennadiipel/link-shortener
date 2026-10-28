FROM oven/bun:1.4.4 AS client-build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/domain/package.json packages/domain/package.json
RUN bun install --frozen-lockfile

COPY apps/client apps/client

ARG VITE_API_URL=/api
ARG VITE_APP_BASE_PATH=/client/
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_BASE_PATH=${VITE_APP_BASE_PATH}

RUN bun run --cwd apps/client build

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=client-build /app/apps/client/dist/client /usr/share/nginx/html/client

EXPOSE 80

HEALTHCHECK --interval=5s --timeout=5s --retries=10 CMD wget -q -O /dev/null http://localhost/client/ || exit 1
