# Story 9.5: Production Security Hardening

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 5 story points
**Status:** Ready for Development

---

## User Story

**As a** security engineer
**I want to** harden production infrastructure against common attacks
**So that** user data and the app are protected from malicious actors

---

## Acceptance Criteria

### Rate Limiting

**API Rate Limiting:**
- [ ] Install rate limiting library: `uv add slowapi`
- [ ] Implement rate limiting middleware in FastAPI
- [ ] Configure rate limits:
  - **Public endpoints** (no auth): 100 requests/minute per IP
  - **Authenticated endpoints**: 1000 requests/minute per user
  - **AI endpoints** (expensive): 10 requests/hour per user
- [ ] Return HTTP 429 (Too Many Requests) when limit exceeded
- [ ] Include `Retry-After` header (RFC 7231) with seconds until reset
- [ ] Log rate limit violations to Sentry (detect abuse patterns)

**Implementation Example:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/goals")
@limiter.limit("1000/minute")
async def get_goals(request: Request):
    # ... endpoint logic
```

### Secrets Management

**Secrets Audit:**
- [ ] Audit all environment variables (verify no secrets in GitHub)
- [ ] Review `.gitignore` to ensure `.env` files excluded
- [ ] Search codebase for hardcoded secrets (use regex: `[A-Za-z0-9]{32,}`)
- [ ] Document all production secrets in secure location (1Password/Bitwarden)

**Railway Secrets:**
- [ ] Store all secrets in Railway secrets dashboard (not `.env` files)
- [ ] Configure secrets:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET`
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `GOOGLE_AI_API_KEY`
  - `SENTRY_DSN`
  - `LOGROCKET_APP_ID`

**API Key Rotation Strategy:**
- [ ] Document quarterly API key rotation procedure
- [ ] Set calendar reminders for key rotation (every 90 days)
- [ ] Test key rotation process in staging environment

### Security Audit

**OWASP ZAP Scan:**
- [ ] Install OWASP ZAP (free open-source scanner): https://www.zaproxy.org/
- [ ] Run automated scan on production API (unauthenticated endpoints)
- [ ] Review scan results for vulnerabilities:
  - SQL injection
  - XSS (cross-site scripting)
  - CSRF (cross-site request forgery)
  - Insecure headers (missing HSTS, CSP, X-Frame-Options)
- [ ] Fix any HIGH or MEDIUM severity vulnerabilities
- [ ] Document OWASP ZAP scan results

**RLS Audit:**
- [ ] Review all 12 user-owned tables for RLS policies
- [ ] Test RLS with 2+ test users (verify no cross-user data leaks)
- [ ] Run penetration test:
  - User A creates goal
  - User B attempts to access User A's goal via API
  - Expected: 403 Forbidden or 404 Not Found
- [ ] Document RLS test results

**Input Validation:**
- [ ] Verify SQL injection prevention (all queries use parameterized queries)
- [ ] Test SQL injection on all POST/PUT endpoints (try `'; DROP TABLE users;--`)
- [ ] Verify XSS prevention (input sanitization on user-generated content)
- [ ] Test XSS on journal entries, goal titles, bind descriptions

**CSRF Protection:**
- [ ] Verify CSRF protection enabled (SameSite cookies)
- [ ] Configure CORS headers (allow only mobile app origin)
- [ ] Test CSRF attack (attempt cross-origin POST request)

### Production-Only Security

**Disable Debug Mode:**
- [ ] Set `DEBUG=false` in Railway environment variables
- [ ] Verify debug endpoints disabled in production (`/docs`, `/redoc`)
- [ ] Set `LOG_LEVEL=INFO` (not DEBUG - reduces log volume)

**HTTPS Enforcement:**
- [ ] Verify Railway auto-provides SSL certificate (HTTPS enabled)
- [ ] Test HTTP requests redirect to HTTPS
- [ ] Verify secure cookie flags:
  - `HttpOnly` (prevents JavaScript access)
  - `Secure` (HTTPS-only)
  - `SameSite=Strict` (CSRF protection)

**CORS Configuration:**
- [ ] Configure CORS whitelist (only allow mobile app origin)
- [ ] Set CORS headers:
  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["exp://192.168.*.*:8081"],  # Expo dev
      allow_credentials=True,
      allow_methods=["GET", "POST", "PUT", "DELETE"],
      allow_headers=["*"],
  )
  ```
- [ ] Test CORS by making request from unauthorized origin (should fail)

---

## Technical Notes

### OWASP ZAP Quick Start
```bash
# Download and install OWASP ZAP
https://www.zaproxy.org/download/

# Run automated scan
zap-cli quick-scan --self-contained https://weave-api-production.railway.app

# Review results in HTML report
```

### Common Vulnerabilities to Check

| Vulnerability | Test Method | Mitigation |
|---------------|-------------|------------|
| **SQL Injection** | Try `'; DROP TABLE--` in inputs | Use parameterized queries (SQLAlchemy ORM) |
| **XSS** | Try `<script>alert('XSS')</script>` | Sanitize HTML, escape user input |
| **CSRF** | Cross-origin POST request | SameSite cookies, CORS whitelist |
| **Weak Secrets** | Grep for short API keys | 256-bit random strings for JWT_SECRET |
| **Missing HTTPS** | HTTP request test | Railway auto-SSL, redirect HTTP → HTTPS |

### Rate Limiting Best Practices
- Use per-user rate limits (more precise than per-IP)
- Set higher limits for authenticated users (trust established users)
- Log rate limit violations (detect bots, abuse patterns)
- Whitelist known IPs (CI/CD runners, monitoring services)

---

## Dependencies

**Requires:**
- Story 9.1 (Production Backend Deployment)
- Story 9.2 (Production Database Setup)

**Unblocks:**
- Story 9.6 (TestFlight Beta Testing - security baseline met)

---

## Definition of Done

- [ ] Rate limiting middleware implemented and tested
- [ ] All secrets stored in Railway dashboard (not GitHub)
- [ ] API key rotation strategy documented
- [ ] OWASP ZAP scan complete (no HIGH/MEDIUM vulnerabilities)
- [ ] RLS audit complete (no cross-user data leaks)
- [ ] SQL injection and XSS tests pass
- [ ] CSRF protection verified
- [ ] Debug mode disabled in production
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Code reviewed and approved

---

## Testing Checklist

- [ ] Rate limiting returns HTTP 429 after limit exceeded
- [ ] `Retry-After` header present in 429 responses
- [ ] Cross-user data access blocked by RLS
- [ ] SQL injection attempts fail
- [ ] XSS attempts sanitized
- [ ] CSRF attacks fail (CORS blocks unauthorized origins)
- [ ] Debug endpoints disabled (`/docs` returns 404)
- [ ] HTTP requests redirect to HTTPS
- [ ] Cookies have `HttpOnly`, `Secure`, `SameSite` flags

---

## Resources

- **OWASP ZAP:** https://www.zaproxy.org/
- **slowapi (Rate Limiting):** https://github.com/laurents/slowapi
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Railway Security Best Practices:** https://docs.railway.app/reference/security

---
