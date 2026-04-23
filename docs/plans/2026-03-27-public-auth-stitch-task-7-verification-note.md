# Task 7 Verification Note

- Route family: `/organizers/[slug]`, `/about`, `/contact`, `/become-organizer`
- Focused lint command for Task 7 surfaces:
  - `pnpm run lint -- "app/organizers/[slug]/page.tsx" "app/about/page.tsx" "app/contact/page.tsx" "app/become-organizer/page.tsx" "components/shared/public-marketing.tsx"`
- Manual route verification via `pnpm run dev` is currently blocked in this environment because app startup fails required env validation before the server can boot.
- Missing env vars reported by startup:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL`
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
