# Environment configuration

## Local development

Run `bun run env:setup` once after cloning. It copies the safe values in
`.env.example` to the ignored `.env.dev` file and creates app-level `.env`
symlinks. Edit `.env.dev` for local overrides; never commit it.

Use `bun run infra:up` to build and start Postgres, Redis, the Bun API, and
Nginx with `.env.dev`. The proxy is available at:

- `http://localhost:8080/api/hello`
- `http://localhost:8080/client/`
- `http://localhost:8080/<short-code>` (temporarily redirects to Google)

For direct application development without Nginx, use `bun run dev` or one of
the app-specific development commands. The direct client runs at
`http://localhost:3000/`; the proxied client runs below `/client/`.

## Production

Never commit `.env.prod`, credentials, or private keys. A future deployment
workflow will read GitHub Actions Secrets and write `.env.prod` on the server
with restrictive permissions. Required secret names are `DATABASE_URL` and
`REDIS_URL`; use `POSTGRES_PASSWORD` too when Postgres is managed by Compose.

`APP_ENV=production`, `API_PORT`, `CLIENT_ORIGIN`, `VITE_API_URL`, and
`VITE_APP_BASE_PATH` are required deployment configuration. Both `VITE_`
values are embedded in browser code and must never contain secrets.

The pull-request CI workflow creates a local `.env.dev` from the committed
template. It never reads production secrets.
