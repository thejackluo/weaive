# 📦 Production Documentation

**Purpose:** Centralized documentation for production deployment, compliance, legal, and readiness verification.

---

## 📁 Directory Structure

```
docs/production/
├── README.md (this file)
├── production-deployment-manual.md          # Step-by-step deployment guide
├── CODE_REVIEW_FIXES_SUMMARY.md             # Code review fixes log
├── production-readiness-checklist.md        # Complete pre-launch checklist
├── test-validation-guide-DRAFT.md           # How to verify all tests pass (DRAFT)
├── compliance-legal-checklist-DRAFT.md      # Compliance and legal requirements (DRAFT)
└── pre-deployment-verification.md           # Automated verification guide
```

**Note:** Scripts have been moved to `scripts/` folder at project root. See `scripts/README.md` for organization.

---

## 🎯 When to Use Each Document

| Document | When to Use | Who |
|----------|-------------|-----|
| **Production Readiness Checklist** | Before EVERY production deployment | Product Manager, Tech Lead |
| **Test Validation Guide (DRAFT)** | Before merging to main or deploying | Developer, QA |
| **Compliance & Legal Checklist (DRAFT)** | Before public launch, quarterly review | Legal, Product Manager |
| **Pre-Deployment Verification** | Run automated checks before deploy | Developer, CI/CD |
| **Deployment Manual** | During actual deployment | DevOps, Developer |
| **Code Review Fixes** | Reference for what was fixed in Story 9.1 | Developer, QA |

---

## 🚀 Quick Start: Production Deployment Workflow

### Step 1: Pre-Deployment Verification (15 minutes)
```bash
# Run automated checks
./scripts/verification/pre-deployment-verification.sh

# Expected: All checks pass (tests, linting, security, builds)
```

### Step 2: Production Readiness Review (30 minutes)
- Open `production-readiness-checklist.md`
- Review all sections: Code Quality, Security, Performance, Compliance, Legal
- Sign off on each section

### Step 3: Test Validation (20 minutes)
- Follow `test-validation-guide.md`
- Ensure:
  - ✅ All unit tests pass (backend + mobile)
  - ✅ All integration tests pass
  - ✅ All deployment tests pass (RLS, API endpoints, security)
  - ✅ No test warnings or skipped critical tests

### Step 4: Compliance & Legal Check (45 minutes)
- Open `compliance-legal-checklist.md`
- Verify:
  - ✅ Privacy policy updated
  - ✅ Terms of service finalized
  - ✅ Data retention policies configured
  - ✅ GDPR/CCPA compliance verified
  - ✅ App Store requirements met

### Step 5: Deploy to Production (1-2 hours)
- Follow `production-deployment-manual.md`
- Execute Parts 1-8 step by step

---

## 📊 Production Deployment Checklist (High-Level)

Use this quick checklist before ANY production deployment:

### Code Quality
- [ ] All tests pass (backend + mobile)
- [ ] Linting passes (no errors, warnings OK)
- [ ] Code review approved
- [ ] Security scan passed (no critical vulnerabilities)

### Infrastructure
- [ ] Railway production project configured
- [ ] Environment variables set (15 variables)
- [ ] GitHub secrets configured
- [ ] Health check endpoint responds

### Testing
- [ ] Unit tests: ✅ Pass
- [ ] Integration tests: ✅ Pass
- [ ] Deployment tests: ✅ Pass (25+ tests)
- [ ] Manual smoke tests: ✅ Pass

### Security
- [ ] RLS policies enabled on all user tables (12 tables)
- [ ] JWT secret is strong (256-bit entropy)
- [ ] AWS Bedrock credentials configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints

### Compliance & Legal
- [ ] Privacy policy accessible in app
- [ ] Terms of service accessible in app
- [ ] Data deletion endpoint implemented
- [ ] User consent flows implemented
- [ ] App Store compliance verified

### Monitoring & Rollback
- [ ] Sentry error tracking configured
- [ ] LogRocket session replay configured
- [ ] Rollback procedure documented
- [ ] Incident response plan ready

### Documentation
- [ ] CLAUDE.md updated with production commands
- [ ] Story status updated to "Complete"
- [ ] Deployment notes documented

---

## 🚨 Emergency Rollback

If deployment fails or critical issues detected:

```bash
# Quick rollback
railway deployments
railway deployment rollback <previous-deployment-id>

# Verify health
curl https://weave-api-production.railway.app/health
```

**Detailed procedures:** See `PRODUCTION_DEPLOYMENT_MANUAL.md` Part 6 + `docs/devops-strategy.md` (lines 602-759)

---

## 📈 Production Deployment History

| Date | Story | Deployment Type | Status | Notes |
|------|-------|----------------|--------|-------|
| 2025-12-23 | Story 9.1 | Initial Production | Pending | Backend deployment to Railway |

---

## 📞 Support & Resources

- **Deployment Issues:** See `production-deployment-manual.md` Troubleshooting section
- **Test Failures:** See `test-validation-guide-DRAFT.md`
- **Compliance Questions:** See `compliance-legal-checklist-DRAFT.md`
- **Script Organization:** See `scripts/README.md` at project root
- **Railway Logs:** `railway logs --tail 100`
- **GitHub Actions:** `gh run list --status=failure`

---

**Last Updated:** 2025-12-23
**Maintained By:** Engineering Team
**Review Frequency:** Before every production deployment
