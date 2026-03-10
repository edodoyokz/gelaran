# Operations Documentation

This directory contains operational documentation for deploying, maintaining, and troubleshooting the Gelaran platform.

## Quick Reference

### Critical Links
- [Pre-Deployment Checklist](./pre-deployment-checklist.md) - Before every deployment
- [Deployment Procedure](./deployment-procedure.md) - How to deploy
- [Rollback Procedure](./rollback-procedure.md) - How to rollback if issues occur
- [Smoke Tests Guide](./smoke-tests.md) - Tests to run after deployment
- [Incident Response Runbook](./incident-response.md) - Handling incidents and emergencies
- [Operator Ownership](./operator-ownership.md) - Roles, responsibilities, and contacts

### Common Tasks

**Deploy to Production:**
1. Complete [Pre-Deployment Checklist](./pre-deployment-checklist.md)
2. Follow [Deployment Procedure](./deployment-procedure.md)
3. Run [Smoke Tests](./smoke-tests.md)
4. Monitor for issues for 24 hours

**Handle Incident:**
1. Assess severity (SEV-1 to SEV-4)
2. Notify on-call engineer via Slack #incidents
3. Follow [Incident Response Runbook](./incident-response.md)
4. Document incident in incident report

**Rollback Deployment:**
1. Identify rollback trigger
2. Follow [Rollback Procedure](./rollback-procedure.md)
3. Run smoke tests to verify
4. Monitor for issues

## Documentation Structure

```
docs/operations/
├── README.md (this file)
├── pre-deployment-checklist.md      # Checklist before deploying
├── deployment-procedure.md          # Step-by-step deployment guide
├── rollback-procedure.md            # How to rollback if issues occur
├── smoke-tests.md                   # Tests to verify system health
├── incident-response.md             # Incident handling procedures
└── operator-ownership.md            # Roles, responsibilities, contacts
```

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-08 | Initial operational documentation | AI Assistant |
| 1.1 | 2026-03-10 | Replaced placeholder commands/contacts with verified operator guidance | Codex |

## Last Review Dates

- [x] Pre-Deployment Checklist: 2026-03-10
- [x] Deployment Procedure: 2026-03-10
- [x] Rollback Procedure: 2026-03-10
- [x] Smoke Tests Guide: 2026-03-10
- [x] Incident Response Runbook: 2026-03-10
- [x] Operator Ownership: 2026-03-10

## Quick Reference Numbers

### Emergency Contacts
- **Primary On-Call:** Current assignee in the secure ops roster and `#incidents`
- **Secondary On-Call:** Current backup assignee in the secure ops roster
- **Engineering Lead:** Current incident commander listed in the secure ops roster
- Keep personal phone numbers and private emails in the secure roster, not in this repository

### Critical Commands

**Health Check:**
```bash
APP_URL="https://<deployment-domain>" curl -fsS "$APP_URL/api/events" >/dev/null
```

**Deploy:**
```bash
vercel --prod
```

**Rollback:**
```bash
# Follow docs/operations/rollback-procedure.md
```

**Database Backup:**
```bash
supabase db dump -f backup-$(date +%Y%m%d).sql
```

**Run Smoke Tests:**
```bash
APP_URL="https://<deployment-domain>" bash -lc 'curl -fsS "$APP_URL/" >/dev/null && curl -fsS "$APP_URL/api/events" >/dev/null'
```

## Status Indicators

| Component | Status | Last Checked |
|-----------|--------|--------------|
| Application | ✅ Record in deployment report | 2026-03-10 |
| Database | ✅ Record in deployment report | 2026-03-10 |
| Email Service | ✅ Record in deployment report | 2026-03-10 |
| Storage | ✅ Record in deployment report | 2026-03-10 |

## Known Issues

### Current Issues
- [ ] None

### Recent Resolved Issues
- Capture recent incidents in Linear or the post-incident report and link them here when needed

### Planned Maintenance
- [ ] [Maintenance window] - [Description]

## Improvement Suggestions

Have a suggestion for improving these operational docs?
1. Create issue in Linear
2. Tag with `operations` label
3. Assign to engineering lead
4. Review in next operational meeting

## Training Resources

### New On-Call Engineer
- Review all documentation in this directory
- Complete onboarding checklist in [Operator Ownership](./operator-ownership.md)
- Shadow experienced on-call for 1 week
- Complete incident response simulation

### All Engineers
- Review documentation quarterly
- Participate in incident retrospectives
- Contribute to documentation improvements
- Stay updated on new procedures

## Related Documentation

### Technical Documentation
- [Project README](../../README.md)
- [API Documentation](../../docs/api/README.md)
- [Database Schema](../../docs/database/README.md)
- [Architecture Overview](../../docs/architecture/README.md)

### External Documentation
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## Compliance and Security

### Data Protection
- All operations comply with data protection regulations
- Access to sensitive data is logged and audited
- Backups are encrypted and stored securely
- Data retention policies are followed

### Security Procedures
- All changes must follow security review process
- Access controls are reviewed quarterly
- Security incidents are handled per [Incident Response Runbook](./incident-response.md)
- Penetration testing is performed annually

## Support and Feedback

### Get Help
1. Check relevant documentation in this directory
2. Search incident history
3. Contact on-call engineer via Slack #operations
4. Escalate to engineering lead if needed

### Provide Feedback
- Submit improvements via GitHub issues
- Discuss in team meetings
- Update documentation directly (if authorized)
- Share lessons learned in retrospectives

---

**Maintained by:** Engineering Team
**Last updated:** 2026-03-10
**Next review:** 2026-06-08

For questions or issues, use Slack `#operations` or escalate via the secure ops roster.
