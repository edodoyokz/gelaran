# Storage Upload Policy

This document defines the explicit storage strategy, upload constraints, and abuse-prevention guidance for Supabase Storage.

## Strategy: Public vs Private Buckets

- `avatars` (public): user profile pictures intended for direct rendering in UI
- `events` (public): event media used on public pages
- `organizers` (public): organizer profile/branding assets
- `tickets` (private): ticket artifacts (including PDFs) that must not be publicly enumerable

All buckets are configured by `scripts/setup-storage.ts` and validated in application code via `lib/storage/upload.ts`.

## Upload Constraints

### `avatars`
- Max size: 2 MB
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`

### `events`
- Max size: 5 MB
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### `organizers`
- Max size: 5 MB
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`

### `tickets`
- Max size: 1 MB
- Allowed MIME: `image/png`, `image/jpeg`, `application/pdf`

## Defense in Depth

Validation is enforced at two layers:

1. **Application validation**
   - `validateUploadFile()` in `lib/storage/upload.ts`
   - Rejects unsupported bucket, disallowed MIME type, and oversized payload before upload

2. **Bucket policy validation**
   - Supabase bucket settings (`fileSizeLimit`, `allowedMimeTypes`) from `scripts/setup-storage.ts`
   - Prevents bypass via direct storage API calls

## Operational Setup

1. Ensure env vars are present:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run:

```bash
pnpm tsx scripts/setup-storage.ts
```

3. Verify each bucket in Supabase dashboard:
   - visibility (public/private)
   - max size
   - allowed MIME list
4. Apply storage policies from the setup script guidance for read/write operations.

## Abuse and Misconfiguration Risk Controls

- Keep `tickets` private to avoid direct public access to ticket artifacts.
- Restrict allowed MIME types tightly; avoid wildcard content types.
- Keep file-size caps conservative to reduce storage abuse.
- Review bucket configuration after any environment migration.
- Use authenticated write policies for all mutable operations.
