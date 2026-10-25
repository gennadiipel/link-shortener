# Environment configuration

## Local development

Run `bun run env:setup` once after cloning. It copies the safe values in
`.env.example` to the ignored `.env.dev` file and creates app-level `.env`
symlinks. Edit `.env.dev` for local overrides; never commit it.

Use `bun run infra:up` to start Postgres and Redis with `.env.dev`, then run
either `bun run dev` or one of the app-specific development commands.

## Production

Never commit `.env.prod`, credentials, or private keys. A future deployment
workflow will read GitHub Actions Secrets and write `.env.prod` on the server
with restrictive permissions. Required secret names are `DATABASE_URL` and
`REDIS_URL`; use `POSTGRES_PASSWORD` too when Postgres is managed by Compose.

`APP_ENV=production`, `API_PORT`, `CLIENT_ORIGIN`, and `VITE_API_URL` are
required deployment configuration. `VITE_API_URL` is embedded in browser code
and must never contain a secret.

The pull-request CI workflow creates a local `.env.dev` from the committed
template. It never reads production secrets.
