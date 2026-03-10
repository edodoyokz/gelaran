# Pre-Deployment Checklist

Use this checklist before deploying to beta or production environments.

## Environment Validation

### Required Environment Variables
- [ ] `DATABASE_URL` is set and points to correct database
- [ ] `DIRECT_URL` is set for Prisma migrations
- [ ] `NEXT_PUBLIC_SUPABASE_URL` matches environment
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is correct and secure
- [ ] `RESEND_API_KEY` is active for email notifications
- [ ] `EMAIL_FROM` is set with proper format
- [ ] `NEXT_PUBLIC_APP_URL` matches deployment domain
- [ ] `NEXT_PUBLIC_APP_STAGE` is set to correct value (`local`/`beta`/`production`)
- [ ] `NEXT_PUBLIC_PAYMENTS_ENABLED` is `false` for beta
- [ ] `NEXT_PUBLIC_ENABLE_DEMO_PAYMENT` is `false` for non-local

### Database Prerequisites
- [ ] Database backup created before deployment
- [ ] Migration files reviewed and tested locally
- [ ] Database connection tested from deployment environment
- [ ] Connection pool limits verified
- [ ] Row Level Security (RLS) policies verified

### Service Integration
- [ ] Supabase connection verified
- [ ] Resend email service tested
- [ ] Storage buckets configured
- [ ] Cron jobs scheduled correctly

## Code Quality

### Build Verification
- [ ] `pnpm run lint` passes with no errors
- [ ] `pnpm run build` completes successfully
- [ ] `pnpm run test` passes all targeted tests
- [ ] TypeScript compilation succeeds
- [ ] No build warnings or deprecations

### Branch and Merge
- [ ] Feature branch merged to main
- [ ] CI/CD pipeline passed successfully
- [ ] No uncommitted changes in working directory
- [ ] Version tags updated if needed

## Feature Flags and Configuration

### Feature State
- [ ] Complimentary booking mode enabled (beta)
- [ ] Payment gateway disabled (beta)
- [ ] Demo mode disabled for non-local environments
- [ ] Maintenance mode off for production deployment

### Admin Settings
- [ ] Platform settings verified in database
- [ ] Email notifications enabled
- [ ] Platform fee percentage confirmed
- [ ] Withdrawal limits configured

## Stakeholder Approval

### Communication
- [ ] Stakeholders notified of deployment window
- [ ] Release notes prepared and shared
- [ ] Support team briefed on changes
- [ ] Marketing team informed if user-facing changes

### Sign-off
- [ ] Tech lead approved deployment
- [ ] Product manager approved deployment
- [ ] Security review completed (if applicable)

## Monitoring Setup

### Observability
- [ ] Logging configured and accessible
- [ ] Error tracking enabled (Sentry or similar)
- [ ] Performance monitoring set up
- [ ] Uptime monitoring configured

### Alerts
- [ ] Error rate alerts configured
- [ ] Response time alerts configured
- [ ] Database connection alerts configured
- [ ] On-call engineer notified

## Documentation

### Release Notes
- [ ] Release notes documented
- [ ] Breaking changes highlighted
- [ ] Migration steps documented
- [ ] Rollback procedure reviewed

### Runbooks
- [ ] Incident response runbook accessible
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed
- [ ] Vendor contact information available

## Final Checks

- [ ] Deployment window confirmed (low traffic period preferred)
- [ ] Rollback plan reviewed and understood
- [ ] Team available for monitoring post-deployment
- [ ] Communication channel open for real-time updates

---

**Checklist completed by:** _____________________
**Date:** _____________________
**Deployment environment:** _____________________
