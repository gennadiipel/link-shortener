# Lapin AMK link shortener project

This project is focused on building a web app for creating and serving short links like Bitly.

The main goal is to achieve a super low latency on a Read path (p50 <1ms at 50k RPS on a cache hit) and create a proper CI/CD pipeline using AWS for both FE and BE apps.

App's layout:

![Screenshot 1](architecture/screenshot1.png)
![Screenshot 2](architecture/screenshot2.png)

## Technical stack

The repository is a monorepo, which works on top of Turborepo (https://turborepo.dev/) and has several apps inside.

### Frontend

A frontend part is a React app, which uses a Tailwind and tools from a Tanstack project.

### Backend

A backend part is written in TypeScript and runs on Bun with Fastify. OpenResty is the public reverse proxy and resolves Redis cache hits before traffic reaches Bun.

### Local reverse proxy

`bun run infra:up` starts the production-like Docker Compose stack. OpenResty
is available on port `8080`: `/api/` proxies to the Bun API, `/client/` serves
the React SPA, and a seven-character short code at `/{code}` is read from Redis
and redirected directly. Cache misses and Redis outages fall back internally to
the API, which resolves Postgres, repairs Redis, and returns either `302` or
`404`. Other paths temporarily return a `302` redirect to Google.

For hot reload, run `bun run infra:dev:up` once, then run `bun run dev:proxy`. The
OpenResty development proxy continues to serve `http://localhost:8080`, while
the API and client run from the host with file watching.

The development proxy uses port `8080` and keeps the OpenResty read path.
For API debugging, call `http://localhost:8000/links/{code}/redirect` directly
while the Bun watcher is running. The proxy is configured for 8,192 worker
connections so high-concurrency local tests do not hit the stock OpenResty
1,024-connection limit.

### Read-path load test

The read-path k6 scenario creates and warms one short link, then measures only
the OpenResty `302` response. It does not follow the destination URL, so remote
site latency is excluded. Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/),
start the production-like stack, migrate the database, then run:

```sh
bun run infra:up
bun run db:migrate
bun run load:read:smoke
```

`bun run load:read` defaults to 100 requests per second for 30 seconds. Tune it
with environment variables such as `READ_PATH_RATE`, `READ_PATH_DURATION`,
`READ_PATH_PRE_ALLOCATED_VUS`, and `READ_PATH_MAX_VUS`. Local Docker results
are a development baseline only. To assess the architecture target of 50k RPS
and p50 below 1 ms, use dedicated production-like infrastructure and one or
more external load generators, for example:

```sh
READ_PATH_RATE=50000 READ_PATH_PRE_ALLOCATED_VUS=500 READ_PATH_MAX_VUS=5000 \
READ_PATH_P50_MS=1 READ_PATH_P95_MS=5 bun run load:read
```

### Data storage

Links will be persistently stored in Postgres and added to Redis cache. Redis cache will be also responsible for counting link opens for analytics. Every minute counters will be updated in Postgres.

New links are written to Postgres first, then cached as `url:{code}` and
`opens:{code}` in Redis. OpenResty keeps hot immutable targets in a bounded
shared-memory L1 cache with a 60-second target lifetime. A cold L1 lookup atomically reads Redis and increments
the Redis counter in one operation; L1 hits redirect without network I/O and
aggregate counter increments for asynchronous Redis flushes. Every minute the
API scans cumulative Redis counters and raises Postgres counts to the latest
snapshot. A failed update retries on the next pass without clearing Redis.
The count is eventually consistent and best effort: proxy or Redis crashes can
lose increments that have not reached durable storage. The API repairs Redis
misses from Postgres, and a temporary cache or analytics failure does not
prevent resolution of a durable link.

## Workspace packages

Internal code is scoped under `@lapinamk-ls/*`. `@lapinamk-ls/domain` contains
link business rules and repository ports, `@lapinamk-ls/database` contains
Kysely/Postgres persistence and migrations, `@lapinamk-ls/cache` owns Redis
key operations, and `@lapinamk-ls/cli` contains operational commands. Create a
link locally after starting infrastructure with:

```sh
bun run db:migrate
bun run cli link:create https://example.com
```

Operational commands use the seven-character short code:

```sh
bun run cli link:delete abc1234
bun run cli link:soft-delete abc1234
bun run cli cache:clear abc1234
```

`link:delete` removes the Postgres row and both Redis keys. `link:soft-delete`
keeps the row with `is_deleted = true`, captures the current Redis opens count,
and clears Redis; deleted links return `404` after OpenResty's target entry
expires. `cache:clear` only removes the two Redis keys. Its purge is one-time:
pending OpenResty increments or later reads can recreate them. Redis failures
make delete commands fail so they can be retried.

`POST /api/links` accepts `{ "targetUrl": "https://example.com" }` and returns
the new public short URL plus a manager code. Store the manager code when it is
returned: dashboard access will use it in a future increment, and ordinary API
responses will not reveal it again.

## Architecture diagrams

### Read path

```mermaid
sequenceDiagram
  actor User
  participant Client
  participant Nginx
  participant Redis
  participant Bun
  participant Postgres

  User->>Client: Opens a short link
  Client->>Nginx: GET /abc1234

  opt OpenResty L1 hit
    Nginx->>Nginx: Increment shared-memory opens
    Nginx-->>Client: 302 Redirect
  end

  opt L1 miss, Redis hit
    Nginx->>Redis: Atomic GET url and INCR opens
    Redis-->>Nginx: Target URL
    Nginx-->>Client: 302 Redirect
  end

  opt Redis miss or outage
    Nginx->>Bun: Resolve short code
    Bun->>Postgres: Query link
    Postgres-->>Bun: Link or not found
    Bun->>Redis: Repair cache and increment opens if available
    Bun-->>Client: 302 Redirect or 404
  end

  opt Every second
    Nginx-)Redis: INCRBY pending L1 opens
  end

  opt Sync counters to Postgres every 1 minute
    Bun->>Redis: SCAN opens:* and MGET snapshots
    Redis-->>Bun: Cumulative opens per code
    Bun->>Postgres: SET opens = GREATEST(opens, snapshot)
    Postgres-->>Bun: OK
  end
```

### Write path

```mermaid
sequenceDiagram
  Actor User
  participant Client
  participant Nginx
  participant Redis
  participant NodeJS
  participant PostgresDB

  User->>Client: Enters target URL
  Client->>Nginx: POST /links { targetUrl }
  Nginx->>NodeJS: POST /links { targetUrl }
  NodeJS->>NodeJS: Validate target URL

  alt Valid target URL
    NodeJS->>NodeJS: Generate short code abc
    NodeJS->>PostgresDB: INSERT link abc -> target URL
    PostgresDB-->>NodeJS: Created link
    NodeJS-)Redis: SET url:abc Target URL
    NodeJS-)Redis: SET opens:abc 0
    NodeJS-->>Nginx: 201 Created /abc
    Nginx-->>Client: 201 Created /abc
    Client-->>User: Shows short link
  else Invalid target URL
    NodeJS-->>Nginx: 400 Bad Request
    Nginx-->>Client: 400 Bad Request
    Client-->>User: Shows validation error
  end
```

### Delete path

```mermaid
sequenceDiagram
  actor Operator
  participant CLI
  participant Redis
  participant Postgres
  participant OpenResty

  Operator->>CLI: link:delete abc1234
  CLI->>Postgres: DELETE link by code
  CLI->>Redis: DEL url and opens keys
  CLI-->>Operator: Deleted or already absent

  Operator->>CLI: link:soft-delete abc1234
  CLI->>Redis: GET current opens count
  CLI->>Postgres: Set is_deleted and retain latest opens
  CLI->>Redis: DEL url and opens keys
  CLI-->>Operator: Soft-deleted

  Operator->>CLI: cache:clear abc1234
  CLI->>Redis: DEL url and opens keys
  CLI-->>Operator: Cache cleared

  Note over OpenResty: Hot targets expire within 60 seconds
```

### Testing

Code will be covered with unit & E2E tests. Load testing will be done using k6 (https://k6.io/).

## Deployment

A full CI/CD will be configured and an app will be deployed to AWS every time a commit goes to the master branch.

### Frontend

A client app will be built, deployed and served in S3.

### API, DB & Cache

The rest of the application will be deployed in EC2 in Docker containers.
