# E-Voucher System Learnings

## 2026-01-26 - Session 1

### Architecture Decision
- Using Static React Components + JSON Config for templates (not dynamic layout builder)
- Templates are code-backed, configured via JSON stored in DB

### Prisma Schema Patterns
- VoucherTemplate: Global templates created by admin
- EventVoucherConfig: Per-event overrides
- Uses `gen_random_uuid()` for UUID generation
- Uses `@db.Uuid` for PostgreSQL UUID type
- All timestamps use `@default(now())` and `@updatedAt`
