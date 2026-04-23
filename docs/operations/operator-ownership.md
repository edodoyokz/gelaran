# Operator Ownership

This document defines operational roles, responsibilities, and ownership for the Gelaran platform.

## Repo-Visible Owner Roster Contract

This repository keeps the operational ownership contract visible without storing personal roster data.

### Kept in repo: role requirements

- Required operational roles such as on-call owner, backup owner, deployment owner, rollback decision owner, watch-window owner, and launch decision owner
- Required access, responsibility, and escalation expectations for each role
- The workstream or checkpoint that each role must cover

### Kept in repo: confirmation checkpoints

For launch-readiness and follow-up evidence, the repo-visible confirmation contract uses these fields only:

| Field | Meaning |
|-------|---------|
| `checkpoint_id` | Stable identifier for the confirmation point, such as `deployment-owner-confirmed` |
| `required_role` | Role that must be covered in the external roster |
| `coverage_window` | Window or handoff period that must be covered, such as `launch window` or `watch window` |
| `roster_status` | Repo-visible status: `pending`, `confirmed`, or `blocked` |
| `evidence_ref` | Link or reference to the repo document recording the checkpoint outcome |
| `last_confirmed_at` | Timestamp of the latest repo-visible confirmation |
| `notes` | Non-sensitive notes about gaps, caveats, or follow-up |

Minimum confirmation checkpoints are:

| `checkpoint_id` | `required_role` | `coverage_window` |
|-----------------|-----------------|-------------------|
| `deployment-owner-confirmed` | Deployment owner | Launch window |
| `rollback-owner-confirmed` | Rollback decision owner | Launch window |
| `primary-oncall-confirmed` | Primary on-call owner | Launch window |
| `backup-oncall-confirmed` | Backup on-call owner | Launch window |
| `watch-window-owner-confirmed` | Watch-window owner | Watch window |
| `decision-owner-confirmed` | Launch decision owner | Readiness review and sign-off |

### Stored externally only: actual owner roster

- Personal names
- Personal email addresses
- Phone numbers
- Shift tables or rotation assignments for a specific date
- Full active roster entries or contact sheets

The secure ops roster remains the source of truth for actual assignees.

## Operational Roles

### On-Call Engineer

**Primary Contact for:** System incidents, deployments, operational issues

**Responsibilities:**
- Monitor system health and respond to alerts
- Handle incidents according to [Incident Response Runbook](./incident-response.md)
- Execute deployments and rollbacks
- Perform daily health checks
- Document operational issues
- Escalate issues as needed

**Required Access:**
- Vercel deployment access
- Supabase database access (read/write)
- Supabase dashboard access
- Resend dashboard access
- Error tracking (Sentry)
- Monitoring and alerting tools
- Slack incident channels
- Admin panel access

**Skills Required:**
- Next.js/React application troubleshooting
- PostgreSQL database management
- API debugging
- Performance monitoring
- Incident response procedures

**On-Call Rotation:** Weekly rotation, Friday to Friday

---

### Engineering Lead / CTO

**Primary Contact for:** Escalations, architectural decisions, critical issues

**Responsibilities:**
- Provide technical guidance and escalation point
- Review and approve deployment procedures
- Make architectural decisions
- Manage engineering team
- Review incident reports
- Drive operational improvements

**Required Access:**
- All On-Call Engineer access
- Cloud provider accounts
- Billing and subscription management
- Team member management
- Vendor relationships

---

### Product Manager

**Primary Contact for:** User impact assessment, feature prioritization

**Responsibilities:**
- Assess user impact of incidents
- Prioritize bug fixes and features
- Coordinate with support team
- Communicate with stakeholders
- Review incident impact on users

**Required Access:**
- Admin panel (read-only)
- Analytics dashboards
- Support ticket system
- Slack communication channels

---

### Support Team Lead

**Primary Contact for:** User inquiries, frontline support

**Responsibilities:**
- Handle user support inquiries
- Escalate technical issues to engineering
- Document common issues
- Provide user feedback to product team
- Monitor social media for issues

**Required Access:**
- Admin panel (read-only)
- User account management (limited)
- Support ticket system
- User database (read-only, sensitive data access)

---

## On-Call Rotation

### Rotation Schedule

| Week | Primary On-Call | Backup On-Call | Week Of |
|------|-----------------|----------------|---------|
| 1 | Secure roster assignee | Secure roster backup | Maintain in ops calendar |
| 2 | Secure roster assignee | Secure roster backup | Maintain in ops calendar |
| 3 | Secure roster assignee | Secure roster backup | Maintain in ops calendar |
| 4 | Secure roster assignee | Secure roster backup | Maintain in ops calendar |

**Rotation Change:** Fridays at 5:00 PM UTC
**Handover Period:** 2 hours overlap

### Handoff Checklist

**Outgoing On-Call:**
- [ ] Current incidents documented
- [ ] Ongoing investigations summarized
- [ ] Pending action items listed
- [ ] Known issues flagged
- [ ] Recent deployments noted

**Incoming On-Call:**
- [ ] Incident response procedures reviewed
- [ ] Access to all tools verified
- [ ] Contact information confirmed
- [ ] Active issues understood
- [ ] Handoff acknowledged in Slack

## Tool Access and Permissions

### Vercel
- **On-Call Engineer:** Deploy, rollback, view logs
- **Engineering Lead:** Full access, billing, team management
- **Others:** View-only (as needed)

### Supabase
- **On-Call Engineer:** Database read/write, dashboard access
- **Engineering Lead:** Full access, billing, team management
- **Support Lead:** Read-only user data
- **Product Manager:** Read-only analytics

### Resend
- **On-Call Engineer:** Send emails, view logs
- **Engineering Lead:** Full access, billing

### Monitoring Tools (Sentry, etc.)
- **On-Call Engineer:** Full access
- **Engineering Lead:** Full access
- **Others:** View-only (as needed)

### GitHub
- **On-Call Engineer:** Read/write repo access
- **Engineering Lead:** Admin access
- **Others:** Read access

### Admin Panel
- **On-Call Engineer:** Full admin access
- **Engineering Lead:** Full admin access
- **Support Lead:** Read-only user data
- **Product Manager:** Read-only analytics

## Training and Onboarding

### New On-Call Engineer Onboarding

**Week 1: Orientation**
- Review all operational documentation
- Set up access to all tools
- Shadow experienced on-call engineer
- Complete incident response simulation

**Week 2: Training**
- Practice deployment procedures
- Run smoke tests
- Review common incidents
- Practice rollback procedures

**Week 3: Shadowing**
- Backup on-call for one week
- Handle non-critical issues
- Participate in incident response
- Document findings

**Week 4: Certification**
- Lead a deployment
- Handle a real incident (supervised)
- Complete onboarding checklist
- Receive on-call certification

### Required Reading
1. [Pre-Deployment Checklist](./pre-deployment-checklist.md)
2. [Deployment Procedure](./deployment-procedure.md)
3. [Rollback Procedure](./rollback-procedure.md)
4. [Smoke Tests Guide](./smoke-tests.md)
5. [Incident Response Runbook](./incident-response.md)
6. Application architecture documentation
7. Database schema documentation

### Ongoing Training
- Quarterly incident response drills
- Monthly operational reviews
- Continuous learning on new features
- Regular documentation updates

## Communication Channels

### Slack Channels

| Channel | Purpose | Members |
|---------|---------|---------|
| #incidents | Active incident discussions | All on-call, engineering lead |
| #deployment-notifications | Deployment status | All engineering |
| #operations | Daily operational discussions | All on-call, engineering lead |
| #support | User support issues | Support team, engineering lead |
| #alerts | Automated system alerts | On-call engineer |

### Emergency Contacts

**Critical Emergency (Service Down):**
- Use the primary, secondary, and engineering lead numbers from the secure ops roster
- Do not store personal phone numbers in this repository

**Non-Critical:**
- Use Slack channels
- Send email to engineering team

## Escalation Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                    Escalation Flow                          │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   Initial   │
    │ On-Call     │
    └──────┬──────┘
           │
           ├─────────────────────────────────────────┐
           │                                         │
    ┌──────▼──────┐                         ┌──────▼──────┐
    │  Resolved   │                         │ Not Resolved│
    └─────────────┘                         └──────┬──────┘
                                                  │
                                            ┌─────▼─────┐
                                            │ Escalate  │
                                            │ to Backup │
                                            └─────┬─────┘
                                                  │
                                                  ├────────────────────────┐
                                                  │                        │
                                           ┌──────▼──────┐         ┌─────▼─────┐
                                           │  Resolved   │         │ Not      │
                                           └─────────────┘         │ Resolved  │
                                                                   └─────┬─────┘
                                                                         │
                                                                   ┌─────▼─────┐
                                                                   │ Escalate  │
                                                                   │ to Eng    │
                                                                   │ Lead      │
                                                                   └─────┬─────┘
                                                                         │
                                                                   ┌─────▼─────┐
                                                                   │  Resolved  │
                                                                   └───────────┘
```

## Performance Metrics

### On-Call Performance
- **MTTR (Mean Time to Resolution):** Target < 60 minutes for SEV-2, < 15 minutes for SEV-1
- **Response Time:** Target < 15 minutes for SEV-1, < 30 minutes for SEV-2
- **Deployment Success Rate:** Target > 95%
- **Rollback Rate:** Target < 5% of deployments

### Review Process
- Monthly on-call performance review
- Quarterly incident retrospective
- Annual process improvement assessment

## Vendor Contact Information

### Support Contacts

**Supabase**
- **Support Email:** support@supabase.io
- **Status Page:** https://status.supabase.com
- **Named Contact:** Maintain in the secure vendor roster

**Resend**
- **Support Email:** support@resend.com
- **Status Page:** https://status.resend.com
- **Named Contact:** Maintain in the secure vendor roster

**Vercel**
- **Support Email:** support@vercel.com
- **Status Page:** https://status.vercel.com
- **Named Contact:** Maintain in the secure vendor roster

**Midtrans** (when enabled)
- **Support Email:** support@midtrans.com
- **Status Page:** https://status.midtrans.com
- **Named Contact:** Maintain in the secure vendor roster

### Contract Information

| Service | Contract Start | Contract End | Renewal Date | SLA |
|---------|---------------|--------------|--------------|-----|
| Supabase | Maintain in finance tracker | Maintain in finance tracker | Maintain in finance tracker | See vendor contract tracker |
| Resend | Maintain in finance tracker | Maintain in finance tracker | Maintain in finance tracker | See vendor contract tracker |
| Vercel | Maintain in finance tracker | Maintain in finance tracker | Maintain in finance tracker | See vendor contract tracker |

## Operational Procedures

### Daily Health Check (Performed by On-Call)
- [ ] Check application health endpoint
- [ ] Review error logs (last 24 hours)
- [ ] Monitor database performance
- [ ] Check external service status
- [ ] Review automated alerts
- [ ] Verify backups completed

### Weekly Operational Review
- Review incidents from past week
- Update documentation as needed
- Identify recurring issues
- Plan improvements
- Share findings with team

### Monthly Operational Review
- Review on-call performance metrics
- Conduct incident retrospective
- Review vendor performance
- Update procedures and runbooks
- Plan training and improvements

### Quarterly Operational Review
- Comprehensive process review
- Vendor relationship review
- Tool evaluation and updates
- Budget and cost review
- Long-term planning

## Change Management

### Operational Changes
Any changes to operational procedures must:
1. Be documented in relevant runbook
2. Be communicated to all on-call engineers
3. Be tested before implementation
4. Be reviewed by engineering lead
5. Be approved by engineering lead

### Access Changes
- Request via Slack #operations channel
- Approve by engineering lead
- Document in this file
- Update access immediately
- Remove access when role changes

## Documentation Updates

### Update Frequency
- This document: Quarterly
- Runbooks: After each incident or major change
- Contact information: Immediately when changed
- Access information: Immediately when changed

### Review Process
- Quarterly review with all on-call engineers
- Annual comprehensive review with engineering team
- Updates approved by engineering lead

---

**Last updated:** 2026-03-10
**Operational sign-off:** Pending named owner assignment in the secure ops roster
**Next review date:** 2026-06-08
