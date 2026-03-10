# Rollback Procedure

This document outlines procedures for rolling back deployments if issues are detected.

## Rollback Triggers

### Critical Triggers (Rollback Immediately)
- Application health check fails
- Complete database connection loss
- Authentication completely broken
- Critical data loss or corruption
- Security vulnerability detected
- Payment processing errors (when enabled)

### High Priority Triggers (Rollback Within 5 Minutes)
- Error rate > 10% for > 5 minutes
- Response time > 5 seconds P95 for > 10 minutes
- Database lock contention affecting users
- Email service completely down
- Storage service inaccessible

### Medium Priority Triggers (Evaluate Within 15 Minutes)
- Feature regression reported
- Performance degradation > 50%
- User-facing bugs affecting core flows
- Third-party integration failures

## Rollback Decision Flow

```
Issue Detected
    ↓
Check Severity
    ↓
Critical? → YES → Immediate Rollback
    ↓ NO
Check Impact
    ↓
Affects > 20% users? → YES → Rollback
    ↓ NO
Check Duration
    ↓
Persisting > 10 min? → YES → Rollback
    ↓ NO
Monitor & Investigate
    ↓
Resolved? → YES → Document
    ↓ NO
Rollback
```

## Rollback Procedures

### Scenario 1: Application Code Rollback

**When:** Issues with new application code, database schema is unchanged

**Steps:**

1. **Identify Last Stable Version**
   ```bash
   # Check deployment history
   vercel list
   git log --oneline -10
   ```

2. **Rollback Application**
   ```bash
   # Rollback to previous deployment
   vercel rollback

   # Or deploy specific commit
   git checkout <stable-commit-hash>
   vercel --prod
   ```

3. **Verify Rollback**
   ```bash
   APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null
   ```

4. **Clear Caches**
   - Clear CDN caches
   - Clear application caches
   - Clear browser caches if needed

5. **Monitor**
   - Watch error rates
   - Monitor response times
   - Check user feedback

**Time Estimate:** 5-10 minutes

### Scenario 2: Database Migration Rollback

**When:** Database migration caused issues

**Steps:**

1. **Stop Application**
   ```bash
   # Stop application to prevent new writes
   vercel scale 0
   ```

2. **Assess Migration**
   - Review migration SQL
   - Check what changes were made
   - Identify rollback strategy

3. **Rollback Migration**
   ```bash
   # Option A: Restore from backup (recommended)
   supabase db restore -f backup-before-deployment-YYYYMMDD-HHMMSS.sql

   # Option B: Create rollback migration (for simple changes)
   pnpm prisma migrate resolve --rolled-back <migration-name>
   ```

4. **Verify Database**
   ```sql
   -- Check critical tables
   SELECT COUNT(*) FROM "User";
   SELECT COUNT(*) FROM "Event";
   ```

5. **Restart Application**
   ```bash
   vercel scale 1
   ```

6. **Verify Rollback**
   ```bash
   APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null
   ```

**Time Estimate:** 15-30 minutes

### Scenario 3: Configuration Rollback

**When:** Platform settings or environment variables caused issues

**Steps:**

1. **Identify Problematic Config**
   - Review recent changes
   - Check admin settings history
   - Identify specific configuration

2. **Rollback Config**
   ```bash
   # For environment variables
   # Update in Vercel dashboard or CLI
   vercel env rm NEXT_PUBLIC_FEATURE_FLAG production
   vercel env add NEXT_PUBLIC_FEATURE_FLAG production

   # For platform settings
   # Access admin panel or API to revert
   APP_URL="https://<deployment-domain>" curl -X PATCH "$APP_URL/api/admin/settings" \
     -H "Content-Type: application/json" \
     -d '{"platformFeePercentage": 5}'
   ```

3. **Clear Caches**
   - Clear CDN caches
   - Clear application caches

4. **Restart Application** (if needed)
   ```bash
   vercel --prod
   ```

5. **Verify Rollback**
   ```bash
   APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null
   ```

**Time Estimate:** 5-15 minutes

### Scenario 4: Full Rollback (Code + Database)

**When:** Multiple issues or uncertain about cause

**Steps:**

1. **Stop Application**
   ```bash
   vercel scale 0
   ```

2. **Restore Database**
   ```bash
   supabase db restore -f backup-before-deployment-YYYYMMDD-HHMMSS.sql
   ```

3. **Rollback Application Code**
   ```bash
   vercel rollback
   ```

4. **Restart Application**
   ```bash
   vercel scale 1
   ```

5. **Verify Everything**
   - Run smoke tests
   - Check all endpoints
   - Monitor error rates

**Time Estimate:** 30-60 minutes

## Rollback Script

```bash
#!/bin/bash
# rollback.sh

set -e

ROLLBACK_TYPE=${1:-code}
BACKUP_FILE=$2

echo "🔄 Starting rollback: $ROLLBACK_TYPE"

case $ROLLBACK_TYPE in
  code)
    echo "Rolling back application code..."
    vercel rollback
    ;;
  database)
    if [ -z "$BACKUP_FILE" ]; then
      echo "❌ Backup file required for database rollback"
      exit 1
    fi
    echo "Rolling back database..."
    supabase db restore -f $BACKUP_FILE
    ;;
  config)
    echo "Rolling back configuration..."
    echo "Manual intervention required"
    ;;
  full)
    echo "Full rollback (code + database)..."
    if [ -z "$BACKUP_FILE" ]; then
      echo "❌ Backup file required for full rollback"
      exit 1
    fi
    vercel scale 0
    supabase db restore -f $BACKUP_FILE
    vercel rollback
    vercel scale 1
    ;;
  *)
    echo "Usage: ./rollback.sh [code|database|config|full] [backup-file]"
    exit 1
    ;;
esac

echo "⏳ Waiting for rollback to complete..."
sleep 30

echo "🔍 Verifying rollback..."
APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null || exit 1

echo "✅ Rollback complete!"
```

## Post-Rollback Verification

### Health Checks
- [ ] Application health endpoint returns 200
- [ ] Database connection is healthy
- [ ] Authentication works
- [ ] No errors in logs

### Functionality Checks
- [ ] Users can login
- [ ] Events load correctly
- [ ] Booking flow works
- [ ] Email notifications sent
- [ ] Admin panel accessible

### Performance Checks
- [ ] Response times are normal
- [ ] Error rate is < 1%
- [ ] Database queries are performant

## Communication During Rollback

**Notify Immediately:**
- Development team
- Operations team
- Stakeholders
- Support team

**Status Updates:**
1. "Rollback initiated - [type]"
2. "Rollback in progress - [ETA]"
3. "Rollback complete - [verification status]"
4. "Incident report will follow"

## Incident Reporting After Rollback

Create incident report including:

1. **What Happened**
   - Time and date
   - What was deployed
   - What symptoms appeared

2. **Why Rollback Was Triggered**
   - Specific triggers
   - Impact assessment
   - Duration of incident

3. **Rollback Details**
   - Type of rollback
   - Steps taken
   - Time to complete

4. **Root Cause Analysis**
   - What went wrong
   - Why it wasn't caught
   - How to prevent recurrence

5. **Follow-up Actions**
   - Fixes needed
   - Process improvements
   - Testing improvements

## Prevention Measures

### Before Deployment
- Comprehensive testing in staging
- Code review process
- Deployment checklist
- Rollback plan review

### During Deployment
- Gradual rollout (feature flags)
- Real-time monitoring
- Automated alerts
- Ready to rollback

### After Deployment
- Extended monitoring period
- User feedback collection
- Performance analysis
- Documentation updates

## Rollback Command Reference

### Vercel
```bash
# List deployments
vercel list

# Rollback to previous
vercel rollback

# Rollback to specific deployment
vercel rollback <deployment-url>

# Scale instances
vercel scale <number>
```

### Supabase
```bash
# List backups
supabase db dumps list

# Restore backup
supabase db restore -f backup.sql

# Download backup
supabase db dump -f backup.sql
```

### Git
```bash
# View recent commits
git log --oneline -10

# Checkout previous commit
git checkout <commit-hash>

# View deployment history
git log --all --graph --decorate
```

---

**Last updated:** 2026-03-10
**Operational sign-off:** Pending named owner assignment in the secure ops roster
