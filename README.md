# Gelaran

## Package Manager
- Official package manager: `pnpm`
- Vercel and CI should use the same package manager for consistent installs and lockfile behavior.

## Verification
- Run targeted tests: `pnpm run test`
- Run full quality gate: `pnpm run verify`

## CI
- GitHub Actions workflow lives at `.github/workflows/ci.yml`
- CI installs dependencies with `pnpm install --frozen-lockfile`
- CI runs the same verification command used locally: `pnpm run verify`

## Notes
- Production build requires application env vars. The CI workflow provides safe placeholder values for build-time validation.
- Current repository lint debt may cause the quality gate to fail until the remaining issues are fixed.
