# Local Development

This guide replaces the old separate quick-start and seed-data notes. Use it for local setup, demo login, and database reset.

## Prerequisites

- `pnpm` as the package manager
- PostgreSQL or Supabase database access
- A populated `.env` file based on `.env.example`

## Environment Setup

1. Copy the example file:

```bash
cp .env.example .env
```

2. Fill the required values in `.env`.

Important variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_STAGE`

Stage behavior:

- `local`: demo login allowed, demo-payment flow may be enabled
- `beta`: complimentary booking flow, live payments must stay off
- `production`: launch-ready mode

## Install and Run

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

## Database Workflow

### Clean reset with seed data

Use this when you want a fresh local database with demo data:

```bash
pnpm prisma migrate reset
```

The reset flow uses `prisma/seed.ts` and prefers `DIRECT_URL` to avoid pooled-connection timeouts during seeding.

### Incremental migration during development

Use this when you want to keep your local data:

```bash
pnpm prisma migrate dev
```

### Run seed manually

```bash
pnpm prisma db seed
```

## Demo Login

Demo quick-login is available only when:

- `NEXT_PUBLIC_APP_STAGE="local"`

Open `/login` and use the quick-login cards. The default password for seeded demo accounts is:

```text
password123
```

## Seeded Demo Accounts

### Admin

- `admin@gelaran.id` - Admin Gelaran Solo

### Organizers

- `info@sriwedari.solo.go.id` - Taman Sriwedari
- `info@gormanahan.solo.go.id` - GOR Manahan
- `hello@solocreativehub.id` - Solo Creative Hub
- `contact@solomusicfest.id` - Solo Music Fest
- `party@solonightlife.id` - Solo Nightlife

### Customers

- `budi.santoso@email.com` - Budi Santoso
- `siti.nur@email.com` - Siti Nurhaliza
- `ahmad.rizki@email.com` - Ahmad Rizki

## Optional Setup

If you need storage buckets and policies for local or shared environments:

```bash
pnpm setup:storage
```

Related policy notes live in [docs/operations/storage-policy.md](../operations/storage-policy.md).

## Verification Commands

```bash
pnpm run test
pnpm run lint
pnpm run typecheck
pnpm run verify
```
