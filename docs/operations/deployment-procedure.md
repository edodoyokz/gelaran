# Deployment Procedure

This document outlines the standard deployment process for the Gelaran platform.

## Prerequisites

Before starting deployment, ensure:
1. [Pre-Deployment Checklist](./pre-deployment-checklist.md) is complete
2. Database backup is created
3. All stakeholders are notified
4. CI/CD pipeline has passed
5. Rollback plan is reviewed and understood

## Deployment Order

### Phase 1: Database Migrations

**When:** During low-traffic window (typically 2-4 AM UTC)

**Steps:**

1. **Backup Database**
   ```bash
   # Via Supabase dashboard or CLI
   supabase db dump -f backup-before-deployment-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Run Migrations**
   ```bash
   # On deployment server
   pnpm prisma migrate deploy
   ```

3. **Verify Migration**
   ```bash
   # Check migration status
   pnpm prisma migrate status
   ```

4. **Seed Initial Data** (if required)
   ```bash
   pnpm prisma db seed
   ```

5. **Health Check**
   - Verify database is accessible
   - Check connection pool status
   - Verify RLS policies are active

### Phase 2: Application Deployment

**When:** Immediately after successful migration

**Steps:**

1. **Deploy Application Code**
   ```bash
   # If using Vercel
   vercel --prod

   # Or via CI/CD pipeline
   # Pipeline will handle deployment automatically
   ```

2. **Wait for Build**
   - Monitor build logs
   - Verify no build errors
   - Check for warnings

3. **Verify Deployment**
   ```bash
   # Check application is responding
   APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null

   # Or visit health endpoint in browser
   ```

4. **Environment Variables**
   - Verify all env vars are loaded
   - Check feature flags are correct
   - Validate service connections

### Phase 3: Configuration Updates

**When:** After application is deployed and responding

**Steps:**

1. **Update Platform Settings** (if needed)
   - Access admin panel
   - Update configuration via API
   - Verify changes are persisted

2. **Clear Caches**
   ```bash
   # Clear any CDN caches
   # Clear Redis or other cache layers
   ```

3. **Warm Up Application**
   - Trigger critical API endpoints
   - Initialize database connections
   - Prime caches

### Phase 4: Post-Deployment Verification

**Steps:**

1. **Health Checks**
   - [ ] Application responds to health endpoint
   - [ ] Database connection is healthy
   - [ ] External services (email, storage) are accessible
   - [ ] Authentication is working

2. **Smoke Tests**
   - [ ] User can login
   - [ ] Event listing loads
   - [ ] Complimentary booking works
   - [ ] Email notifications sent
   - [ ] Admin panel accessible

3. **Monitoring**
   - [ ] Error rates are normal
   - [ ] Response times are acceptable
   - [ ] Database queries are performant
   - [ ] No alerts firing

## Rollback Triggers

Initiate rollback if any of these conditions occur:

**Critical:**
- Application health check fails
- Database connection errors
- Authentication completely broken
- Critical data loss or corruption

**High:**
- Error rate > 10% for > 5 minutes
- Response time > 5 seconds P95 for > 10 minutes
- Payment processing failures (when enabled)
- Email service completely down

**Medium:**
- Feature regression reported
- Performance degradation
- User-facing bugs affecting core flows

## Zero-Downtime Considerations

### Database Migrations
- Use additive changes (add columns, tables)
- Avoid destructive migrations (drop columns, tables)
- Use `ALTER TABLE` with minimal locking
- Consider application-level compatibility layers

### Application Deployment
- Blue-green deployment when possible
- Health check delays before traffic routing
- Graceful shutdown of old instances
- Warm-up period for new instances

### Feature Flags
- Use feature flags for new functionality
- Gradual rollout with percentage-based flags
- Instant rollback via flag toggling
- A/B testing support

## Deployment Script Example

```bash
#!/bin/bash
# deploy.sh

set -e

ENVIRONMENT=${1:-beta}
BACKUP_FILE="backup-before-$(date +%Y%m%d-%H%M%S).sql"

echo "🚀 Starting deployment to $ENVIRONMENT"
echo "📦 Creating backup..."
supabase db dump -f $BACKUP_FILE

echo "🗄️ Running migrations..."
pnpm prisma migrate deploy

echo "🔍 Verifying migration..."
pnpm prisma migrate status

echo "🚢 Deploying application..."
vercel --prod

echo "⏳ Waiting for application to be ready..."
sleep 30

echo "🔎 Running health checks..."
APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null || exit 1

echo "✅ Deployment complete!"
echo "📋 Run smoke tests to verify functionality"
```

## Post-Deployment Monitoring

Monitor these metrics for the first hour:

**Application Health:**
- Response time (P50, P95, P99)
- Error rate
- Request rate
- Memory usage

**Database Health:**
- Connection pool usage
- Query performance
- Lock wait times
- Replication lag (if applicable)

**External Services:**
- Email delivery rate
- Storage latency
- Third-party API response times

## Communication

**Before Deployment:**
- Notify team in Slack/communication channel
- Post deployment window
- Share release notes

**During Deployment:**
- Update status in real-time
- Flag any issues immediately
- Escalate if rollback needed

**After Deployment:**
- Confirm successful deployment
- Share deployment summary
- Monitor for issues for 24 hours

---

**Last updated:** 2026-03-10
**Operational sign-off:** Pending named owner assignment in the secure ops roster
