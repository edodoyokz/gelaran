# Gelaran

Gelaran is a multi-role event ticketing platform for local event operations in Solo/Surakarta. The repository contains the customer experience, admin back office, organizer tools, POS flow, gate check-in flow, operational runbooks, and implementation records.

## Stack

- Next.js 16
- React 19
- Prisma
- Supabase
- Midtrans
- Resend
- pnpm

## Getting Started

Use `pnpm` for every install and script in this repository.

1. Copy `.env.example` to `.env` and fill in the required values.
2. Install dependencies with `pnpm install`.
3. Generate Prisma client with `pnpm prisma generate`.
4. Prepare the database:
   - clean local reset: `pnpm prisma migrate reset`
   - incremental local migration: `pnpm prisma migrate dev`
5. Start the app with `pnpm dev`.

Detailed local setup, seeding, and demo-account notes live in [docs/setup/local-development.md](docs/setup/local-development.md).

## Verification

- Test suite: `pnpm run test`
- Lint: `pnpm run lint`
- Typecheck: `pnpm run typecheck`
- Full verification: `pnpm run verify`

## Documentation

Start from [docs/README.md](docs/README.md).

- Local setup and demo data: [docs/setup/local-development.md](docs/setup/local-development.md)
- Product requirements summary: [docs/product/requirements.md](docs/product/requirements.md)
- Operations runbooks: [docs/operations/README.md](docs/operations/README.md)
- Go-live package: [docs/go-live/README.md](docs/go-live/README.md)
- Historical plans and design notes: [docs/plans/README.md](docs/plans/README.md)
