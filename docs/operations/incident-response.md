# Incident Response Runbook

This runbook provides procedures for handling incidents and emergencies affecting the Gelaran platform.

## Incident Severity Levels

### SEV-1: Critical (Immediate Response Required)
- Complete service outage
- Data loss or corruption
- Security breach
- Payment processing failure
- Impacting all users

**Response Time:** < 15 minutes
**Escalation:** Immediately to CTO/Engineering Lead
**Communication:** Internal incident update immediately; publish external status only if a customer-facing status channel exists

### SEV-2: High (Urgent Response Required)
- Major feature broken
- Performance degradation > 50%
- Partial service outage
- Authentication issues affecting many users
- Email service down

**Response Time:** < 30 minutes
**Escalation:** Within 1 hour
**Communication:** Internal team notification

### SEV-3: Medium (Normal Response)
- Minor feature broken
- Performance degradation < 50%
- Limited user impact
- Third-party integration issues
- UI/UX bugs

**Response Time:** < 2 hours
**Escalation:** If unresolved in 4 hours
**Communication:** Team notification

### SEV-4: Low (Routine)
- Non-critical bugs
- Documentation issues
- Enhancement requests
- Minor performance improvements

**Response Time:** Next business day
**Escalation:** Not required
**Communication:** Track in backlog

## Escalation Paths

### Primary On-Call Engineer
- **Assignment source:** Secure ops roster
- **Contact path:** `#incidents`, paging tool, or primary phone in the secure roster
- **Slack:** @oncall

### Secondary On-Call Engineer
- **Assignment source:** Secure ops roster
- **Contact path:** Backup paging target or secondary phone in the secure roster
- **Slack:** @oncall-backup

### Engineering Lead / CTO
- **Assignment source:** Secure ops roster
- **Contact path:** Incident commander phone in the secure roster
- **Slack:** @engineering-lead
- **Email:** Use private work email from the secure roster

### Product Manager
- **Assignment source:** Secure ops roster
- **Contact path:** Product escalation contact in the secure roster
- **Slack:** @product-manager
- **Email:** Use private work email from the secure roster

### Support Team Lead
- **Assignment source:** Secure ops roster
- **Contact path:** Support escalation contact in the secure roster
- **Slack:** @support-lead
- **Email:** Use private work email from the secure roster

## Incident Response Workflow

### Phase 1: Detection and Triage (0-15 minutes)

**Detection Sources:**
- Automated alerts (Sentry, monitoring tools)
- User reports (support tickets, social media)
- Internal team observations
- External monitoring services

**Triage Steps:**
1. **Assess Severity**
   - How many users affected?
   - What functionality broken?
   - Business impact?

2. **Assign Severity Level**
   - Use severity definitions above
   - Consider duration and scope

3. **Create Incident Channel**
   ```bash
   # Slack
   /incident-create sev-1-platform-down

   # Or manual
   # Create channel #incident-YYYYMMDD-description
   ```

4. **Notify On-Call Engineer**
   - Page on-call engineer
   - Post in #incidents channel
   - Send SMS if SEV-1

### Phase 2: Investigation (15-30 minutes)

**Gather Information:**
1. **Check Monitoring**
   - Application metrics
   - Database metrics
   - External service status
   - Error logs

2. **Review Recent Changes**
   - Recent deployments
   - Configuration changes
   - Database migrations
   - Third-party updates

3. **Identify Root Cause**
   - What triggered the issue?
   - What component is failing?
   - What error patterns exist?

**Diagnostic Commands:**
```bash
# Check application health
APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check error logs
tail -f /var/log/app/error.log

# Check recent deployments
vercel list

# Check database locks
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state != 'idle'"
```

### Phase 3: Mitigation (30-60 minutes)

**Immediate Actions:**
1. **Stabilize System**
   - If critical: rollback deployment
   - If database issue: restart service
   - If external service: enable fallback
   - If traffic spike: scale up or rate limit

2. **Temporary Workarounds**
   - Feature flags to disable broken features
   - Cached responses for degraded functionality
   - Manual processing where automated systems fail

3. **Communication**
   - Update incident channel
   - Notify stakeholders
   - Update status page (SEV-1/SEV-2)
   - Prepare user communication

### Phase 4: Resolution (1-4 hours)

**Permanent Fix:**
1. **Implement Fix**
   - Code fix
   - Configuration change
   - Database fix
   - Process change

2. **Test Fix**
   - Verify in staging
   - Run smoke tests
   - Check edge cases

3. **Deploy Fix**
   - Follow deployment procedure
   - Monitor post-deployment
   - Verify resolution

### Phase 5: Post-Incident (4-24 hours)

**Activities:**
1. **Verify Resolution**
   - Confirm no new errors
   - Monitor for recurrence
   - Check user feedback

2. **Document Incident**
   - Create incident report
   - Update runbooks
   - Share lessons learned

3. **Improve Processes**
   - Update monitoring/alerts
   - Improve testing
   - Update documentation
   - Implement preventive measures

## Common Incidents

### Incident: Complete Application Outage

**Symptoms:**
- All endpoints return 5xx errors
- Application health check fails
- Users cannot access platform

**Immediate Actions:**
1. Check application logs
2. Verify deployment status
3. Check database connectivity
4. Check external service dependencies

**Potential Causes:**
- Recent deployment failed
- Database connection lost
- Critical bug in code
- Infrastructure failure

**Mitigation:**
- Rollback recent deployment
- Restart application services
- Contact infrastructure provider

**Estimated Resolution:** 30-60 minutes

---

### Incident: Database Connection Issues

**Symptoms:**
- Database timeout errors
- Slow queries
- Connection pool exhausted

**Immediate Actions:**
1. Check database status
2. Review slow queries
3. Check connection pool settings
4. Monitor lock contention

**Potential Causes:**
- Database overload
- Long-running queries
- Connection leak
- Insufficient resources

**Mitigation:**
- Restart database service
- Kill long-running queries
- Scale database resources
- Implement connection pooling

**Estimated Resolution:** 30-120 minutes

---

### Incident: Authentication Failure

**Symptoms:**
- Users cannot login
- Auth endpoints return errors
- Session issues

**Immediate Actions:**
1. Check auth service status
2. Verify environment variables
3. Check Supabase service
4. Review auth logs

**Potential Causes:**
- Supabase service outage
- Invalid auth keys
- Configuration error
- Token expiration issues

**Mitigation:**
- Restore auth service
- Update auth configuration
- Clear invalid sessions
- Contact Supabase support

**Estimated Resolution:** 30-60 minutes

---

### Incident: Email Service Failure

**Symptoms:**
- Email notifications not sent
- Email API returns errors
- Users not receiving confirmations

**Immediate Actions:**
1. Check Resend service status
2. Verify API key validity
3. Review email logs
4. Test email sending

**Potential Causes:**
- Resend service outage
- API key expired
- Rate limiting
- Invalid email addresses

**Mitigation:**
- Switch to backup email provider
- Update API credentials
- Implement queueing
- Disable non-critical emails

**Estimated Resolution:** 30-60 minutes

---

### Incident: Performance Degradation

**Symptoms:**
- Slow page loads
- High response times
- User complaints

**Immediate Actions:**
1. Check application metrics
2. Review database performance
3. Monitor resource usage
4. Check CDN status

**Potential Causes:**
- High traffic load
- Database query performance
- CDN issues
- Resource exhaustion

**Mitigation:**
- Scale up resources
- Optimize database queries
- Clear caches
- Enable rate limiting

**Estimated Resolution:** 30-120 minutes

---

### Incident: Data Corruption

**Symptoms:**
- Incorrect data displayed
- Missing data
- Data inconsistency

**Immediate Actions:**
1. **STOP APPLICATION** immediately
2. Assess scope of corruption
3. Identify affected tables
4. Check database integrity

**Potential Causes:**
- Failed migration
- Concurrent writes
- Application bug
- Database issues

**Mitigation:**
- Restore from backup
- Implement data validation
- Fix application bug
- Repair data manually

**Estimated Resolution:** 2-8 hours

---

## Communication Templates

### SEV-1 Public Status Update

```
Status: Major Service Outage

We are currently experiencing a major service outage affecting all users.
Our engineering team is actively working to resolve the issue.

Affected Services:
- All platform functionality

Next Update: Within 30 minutes

We apologize for the inconvenience.
```

### SEV-2 Internal Notification

```
🚨 SEV-2 Incident: [Brief Description]

Status: Investigating
Impact: [Number of users affected]
Duration: Started at [Time]

On-Call Engineer: @name
Incident Channel: #incident-YYYYMMDD-description

Next Update: Within 30 minutes
```

### Incident Resolution Update

```
✅ Incident Resolved: [Description]

The incident has been resolved and all services are operating normally.

Duration: [X hours]
Impact: [Summary of impact]
Root Cause: [Brief explanation]

We will conduct a post-incident review to prevent recurrence.
```

## Incident Report Template

```markdown
# Incident Report: [Title]

## Summary
[Brief description of incident]

## Timeline
- **[Time]:** Incident detected
- **[Time]:** Severity assigned: SEV-X
- **[Time]:** Investigation started
- **[Time]:** Mitigation implemented
- **[Time]:** Resolution achieved
- **[Time]:** Normal service restored

## Impact
- **Severity:** SEV-X
- **Users Affected:** [Number/Percentage]
- **Duration:** [Time]
- **Business Impact:** [Description]

## Root Cause
[Detailed explanation of what caused the incident]

## Resolution
[Steps taken to resolve the incident]

## Lessons Learned
1. [What went well]
2. [What could be improved]
3. [Action items to prevent recurrence]

## Action Items
- [ ] [Action item 1] - Owner: @name - Due: Date
- [ ] [Action item 2] - Owner: @name - Due: Date

## Attachments
- [Logs]
- [Screenshots]
- [Metrics]
```

## Incident Command System Roles

### Incident Commander
- Overall incident management
- Decision making
- Communication coordination

### Operations Lead
- Technical investigation
- Implementation of fixes
- System recovery

### Communications Lead
- External communication
- Stakeholder updates
- Status page management

### Documentation Lead
- Incident documentation
- Timeline tracking
- Report generation

## Monitoring and Alerting

### Critical Alerts (SEV-1)
- Application health check failure
- Error rate > 5%
- Database connection loss
- Authentication service down

### Warning Alerts (SEV-2)
- Error rate > 1%
- Response time > 2s P95
- Database connection pool > 80%
- Email service errors

### Info Alerts (SEV-3)
- Increased error rate
- Performance degradation
- Third-party service warnings

## Vendor Contact Information

### Supabase
- **Support:** support@supabase.io
- **Status:** https://status.supabase.com
- **SLA:** See vendor contract tracker / workspace billing portal

### Resend
- **Support:** support@resend.com
- **Status:** https://status.resend.com
- **SLA:** See vendor contract tracker / workspace billing portal

### Vercel
- **Support:** support@vercel.com
- **Status:** https://status.vercel.com
- **SLA:** See vendor contract tracker / workspace billing portal

### Midtrans (when enabled)
- **Support:** support@midtrans.com
- **Status:** https://status.midtrans.com
- **SLA:** See vendor contract tracker / workspace billing portal

---

**Last updated:** 2026-03-10
**Operational sign-off:** Pending named owner assignment in the secure ops roster
