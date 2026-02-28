# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Station Stock Manager is a Next.js 16 fuel inventory management app with Clerk auth, Drizzle ORM (PostgreSQL), and Tailwind CSS 4. See `CLAUDE.md` and `README.md` for full command reference.

### Environment Setup

- The app reads config from `.env.local` via dotenv. The injected environment variables (`DATABASE_URL`, `CLERK_SECRET_KEY`, etc.) must be written into `.env.local` because dotenv does **not** override existing env vars — the file must exist for the app to work.
- If the injected `DATABASE_URL` points to an unreachable Supabase instance, install PostgreSQL locally: `sudo apt-get install -y postgresql && sudo pg_ctlcluster 16 main start`, create a database, and set `DATABASE_URL` to a local PostgreSQL connection string in `.env.local`.
- Push schema to a fresh database with `DATABASE_URL=<local-url> npx drizzle-kit push` (prefix with the env var to override the injected one).

### Running Services

- **Dev server**: `npm run dev` (runs on port 3000 with Turbopack)
- **PostgreSQL**: Must be running for any database-dependent features. Start with `sudo pg_ctlcluster 16 main start`.

### Lint

- `next lint` is **not available** in Next.js 16. Run ESLint directly: `npx eslint app/ components/ lib/ actions/`.
- 3 pre-existing lint errors exist in `actions/sales.ts` (not introduced by setup).

### Testing

- **Unit tests**: `npm run test:unit` — runs Jest with mocked DB/auth. 9 of 26 suites pass; failures are pre-existing test expectation mismatches.
- **E2E tests**: `npm run test:e2e` — requires Playwright Chromium (`npx playwright install --with-deps chromium`).
- Jest setup mocks all env vars, Clerk, Next.js navigation, and Drizzle ORM (see `jest.setup.js`), so unit tests do **not** require a running database.

### Gotchas

- `dotenv` in `db/index.ts` and `drizzle.config.ts` reads `.env.local` but won't override env vars already set in the shell. When running drizzle-kit commands, prefix with `DATABASE_URL=<url>` to ensure the correct value is used.
- Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`; a warning is emitted at startup but doesn't break anything.
