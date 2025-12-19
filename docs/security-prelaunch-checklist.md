# Security Pre-Launch Checklist

**Project:** Weave MVP
**Last Updated:** 2025-12-16
**Target Launch:** Alpha Release (First 100 Users)
**Owner:** Jack + Engineering Team

---

## 🎯 Critical Path to Alpha (Must Complete)

### Phase 1: Core Security Foundation (Week 1)

#### Authentication & Authorization
- [ ] **Enable RLS on all user-owned tables** (1 day)
  - [ ] `user_profiles` - RLS policies created and tested
  - [ ] `identity_docs` - RLS policies created and tested
  - [ ] `goals` - RLS policies created and tested
  - [ ] `qgoals` - RLS policies created and tested
  - [ ] `subtask_templates` - RLS policies created and tested
  - [ ] `subtask_instances` - RLS policies created and tested
  - [ ] `subtask_completions` - RLS policies created and tested (immutable)
  - [ ] `captures` - RLS policies created and tested
  - [ ] `journal_entries` - RLS policies created and tested
  - [ ] `daily_aggregates` - RLS policies created and tested
  - [ ] `user_stats` - RLS policies created and tested
  - [ ] `triad_tasks` - RLS policies created and tested
  - [ ] `ai_runs` - RLS policies created and tested
  - [ ] `ai_artifacts` - RLS policies created and tested
  - [ ] `event_log` - RLS policies created and tested

  **Reference:** `docs/security-architecture.md:189-315`

- [ ] **Test RLS with multiple test users** (0.5 day)
  - [ ] Create 3 test accounts with different data
  - [ ] Verify user A cannot access user B's data
  - [ ] Verify user B cannot access user C's data
  - [ ] Test all CRUD operations respect RLS
  - [ ] Document test results

- [ ] **JWT verification middleware** (0.5 day)
  - [ ] Implement `get_current_user` dependency
  - [ ] Apply to all protected endpoints
  - [ ] Test with expired tokens
  - [ ] Test with invalid tokens
  - [ ] Test with missing tokens

  **Reference:** `docs/security-architecture.md:136-187`

- [ ] **Secure token storage (iOS Keychain)** (0.5 day)
  - [ ] Configure Expo SecureStore
  - [ ] Store access_token in Keychain
  - [ ] Store refresh_token in Keychain
  - [ ] Clear tokens on logout
  - [ ] Test token persistence across app restarts

  **Reference:** `docs/security-architecture.md:1082-1140`

#### Input Validation & API Security
- [ ] **Input validation with Pydantic** (Integrated)
  - [ ] All API request schemas defined
  - [ ] Validation errors return user-friendly messages
  - [ ] SQL injection prevented (Pydantic + parameterized queries)
  - [ ] XSS prevented (HTML stripping on text inputs)

  **Reference:** `docs/security-architecture.md:498-573`

- [ ] **File upload validation** (0.5 day)
  - [ ] Magic bytes validation (detect actual file type)
  - [ ] File size limits enforced (10MB max)
  - [ ] Allowed file types: JPEG, PNG, MP3 only
  - [ ] Filename sanitization (prevent path traversal)
  - [ ] Image decompression bomb protection

  **Reference:** `docs/security-architecture.md:824-896`

- [ ] **Rate limiting (basic)** (0.5 day)
  - [ ] Configure Redis for rate limiting
  - [ ] Apply limits to auth endpoints (10/min per IP)
  - [ ] Apply limits to AI endpoints (10/hour per user)
  - [ ] Apply limits to file uploads (50/day per user)
  - [ ] Return 429 with retry-after header

  **Reference:** `docs/security-architecture.md:575-669`

#### HTTPS & Transport Security
- [ ] **HTTPS enforcement** (Configuration only)
  - [ ] Railway: Force HTTPS redirect enabled
  - [ ] Supabase: HTTPS-only connections
  - [ ] Mobile app: ATS enabled (no exceptions)
  - [ ] Verify all API calls use HTTPS in production

  **Reference:** `docs/security-architecture.md:345-362`, `docs/security-architecture.md:1206-1224`

- [ ] **Error handling without data leaks** (0.5 day)
  - [ ] Global exception handler implemented
  - [ ] Sanitized error messages for 500 errors
  - [ ] Error IDs for support tracking
  - [ ] No stack traces exposed to clients
  - [ ] Sensitive data filtered from logs

  **Reference:** `docs/security-architecture.md:704-771`

---

### Phase 2: AI Security (Week 1-2)

- [ ] **Prompt injection prevention** (0.5 day)
  - [ ] Implement `PromptSafetyFilter` class
  - [ ] Pattern detection for injection attempts
  - [ ] Input sanitization before AI calls
  - [ ] Clear separation of system/user content
  - [ ] Log suspected injection attempts

  **Reference:** `docs/security-architecture.md:1325-1411`

- [ ] **AI rate limiting** (0.5 day)
  - [ ] User limits: 10 chat/hour, 3 triad regen/hour
  - [ ] System daily budget: $83.33/day ($2,500/month)
  - [ ] Per-user daily budget: $1.00/user/day
  - [ ] Cost tracking per operation
  - [ ] Alert at 80% of daily budget

  **Reference:** `docs/security-architecture.md:1413-1501`

- [ ] **AI output validation** (0.5 day)
  - [ ] Strip `<script>` tags from AI responses
  - [ ] Remove `javascript:` protocol
  - [ ] Limit output length (10k chars max)
  - [ ] Test with adversarial inputs

  **Reference:** `docs/security-architecture.md:1550-1563`

---

### Phase 3: Compliance & Privacy (Week 2)

- [ ] **Privacy Policy** (1 day - content creation)
  - [ ] Draft privacy policy covering:
    - [ ] What data is collected (email, journal, photos, usage)
    - [ ] How data is used (app functionality, AI processing)
    - [ ] Third-party sharing (OpenAI, Anthropic, analytics)
    - [ ] Data retention periods (see retention table)
    - [ ] User rights (access, export, deletion)
    - [ ] Contact information (security@weave.app)
  - [ ] Legal review (optional for alpha, required for App Store)
  - [ ] Publish at `https://weave.app/privacy`
  - [ ] Link from app signup flow

  **Reference:** `docs/security-architecture.md:1697-1738`

- [ ] **Data export endpoint** (0.5 day)
  - [ ] Implement `/privacy/export` endpoint
  - [ ] Export format: JSON with all user data
  - [ ] Include: profile, goals, journals, completions, capture metadata
  - [ ] Log export events for audit
  - [ ] Test with sample user data

  **Reference:** `docs/security-architecture.md:1591-1616`

- [ ] **Account deletion** (1 day)
  - [ ] Implement `/privacy/delete` endpoint
  - [ ] 30-day grace period before permanent deletion
  - [ ] Cascade delete: profile → goals → journals → captures
  - [ ] Delete files from Supabase Storage
  - [ ] Delete Supabase Auth user
  - [ ] Send confirmation email
  - [ ] Implement `/privacy/delete/cancel` endpoint
  - [ ] Test full deletion flow

  **Reference:** `docs/security-architecture.md:1617-1663`, `docs/security-architecture.md:1741-1786`

- [ ] **COPPA age verification** (0.5 day)
  - [ ] Add birth_date to signup flow
  - [ ] Calculate age at registration
  - [ ] Reject users under 13 with clear message
  - [ ] Set App Store age rating to 12+

  **Reference:** `docs/security-architecture.md:1667-1696`

---

### Phase 4: Monitoring & Logging (Week 2)

- [ ] **Security event logging** (0.5 day)
  - [ ] Implement structured logging (structlog)
  - [ ] Log auth events (success, failure, logout)
  - [ ] Log access denied events
  - [ ] Log rate limit events
  - [ ] Log data export/delete requests
  - [ ] Log AI injection attempts
  - [ ] Log file upload rejections

  **Reference:** `docs/security-architecture.md:1935-2020`

- [ ] **Environment configuration** (0.5 day)
  - [ ] Separate `.env.development` and `.env.production`
  - [ ] Never commit `.env` files to git
  - [ ] Use Railway environment variables for production
  - [ ] Rotate API keys before public launch
  - [ ] Document required environment variables

  **Reference:** `docs/security-architecture.md:2238-2261`

---

## 📋 iOS App Store Requirements (Before Submission)

### Required Before App Store Review

- [ ] **App Transport Security (ATS)** (Configuration)
  - [ ] `NSAllowsArbitraryLoads: false` in Info.plist
  - [ ] No ATS exceptions
  - [ ] Verify all HTTP requests fail (HTTPS only)

  **Reference:** `docs/security-architecture.md:1206-1224`

- [ ] **Privacy Nutrition Label** (App Store Connect)
  - [ ] Declare data collection: email, journal, photos, usage
  - [ ] Specify purposes: account creation, app functionality, analytics
  - [ ] Mark all data as "Linked to Identity"
  - [ ] Upload to App Store Connect

  **Reference:** `docs/security-architecture.md:1699-1710`

- [ ] **Sign in with Apple** (Required if using OAuth)
  - [ ] Implement Apple Sign-In button
  - [ ] Configure Apple Developer account
  - [ ] Test sign-in flow
  - [ ] Implement "Continue with Apple" as primary option

  **Reference:** `docs/security-architecture.md:74-83`

- [ ] **Privacy Policy URL** (App Store Connect)
  - [ ] Privacy policy published at public URL
  - [ ] URL added to App Store Connect
  - [ ] Policy accessible without app download
  - [ ] Policy matches App Store declarations

---

## ✅ Verification Tests (Before Alpha Launch)

### Authentication Tests
```bash
# Test 1: Valid login succeeds
# Test 2: Invalid credentials fail
# Test 3: Expired token gets rejected
# Test 4: Refresh token rotation works
# Test 5: Logout clears all tokens
```

### Authorization Tests (RLS)
```bash
# Test 1: User A creates goal → User B cannot see it
# Test 2: User A creates journal → User B cannot read it
# Test 3: User A uploads photo → User B cannot access signed URL
# Test 4: User tries to update another user's goal → 403 Forbidden
# Test 5: User tries to delete another user's journal → 403 Forbidden
```

### Input Validation Tests
```bash
# Test 1: SQL injection in goal title → Sanitized
# Test 2: XSS in journal entry → HTML stripped
# Test 3: Oversized file upload → 413 Payload Too Large
# Test 4: Wrong file type → 400 Bad Request
# Test 5: Path traversal in filename → Sanitized
```

### Rate Limiting Tests
```bash
# Test 1: 11th auth attempt in 1 minute → 429 Rate Limited
# Test 2: 11th AI chat in 1 hour → 429 Rate Limited
# Test 3: 51st file upload in 1 day → 429 Rate Limited
# Test 4: Rate limit resets after period → Success
```

### AI Security Tests
```bash
# Test 1: Prompt injection attempt → Filtered or logged
# Test 2: Malicious journal content → Sanitized before AI
# Test 3: AI output with <script> → Stripped before return
# Test 4: User exceeds $1/day AI budget → 429 Rate Limited
```

---

## 🚨 Pre-Launch Security Review

**1 Day Before Alpha Launch:**

- [ ] **Final Security Audit**
  - [ ] Review all RLS policies (no tables missing)
  - [ ] Review all API endpoints (all have auth)
  - [ ] Review all file upload handlers (validation enabled)
  - [ ] Review error messages (no sensitive data)
  - [ ] Review logs (no API keys or tokens logged)

- [ ] **Penetration Testing (Self-Assessment)**
  - [ ] Try to access another user's data (should fail)
  - [ ] Try to upload malicious files (should fail)
  - [ ] Try to bypass rate limits (should fail)
  - [ ] Try prompt injection attacks (should fail or log)
  - [ ] Try to extract system prompts (should fail)

- [ ] **Incident Response Prep**
  - [ ] Security contact email set up (security@weave.app)
  - [ ] On-call rotation defined (Jack as primary)
  - [ ] Incident response runbook accessible
  - [ ] Rollback procedure documented

---

## 📊 Security Checklist Progress Tracker

### Critical Path Items (Must Complete Before Alpha)
```
Authentication & Authorization:    [ ] 0/5 completed
Input Validation & API Security:   [ ] 0/4 completed
HTTPS & Transport Security:        [ ] 0/2 completed
AI Security:                       [ ] 0/3 completed
Compliance & Privacy:              [ ] 0/4 completed
Monitoring & Logging:              [ ] 0/2 completed

TOTAL CRITICAL PATH:               0/20 (0%)
```

### iOS App Store Requirements (Before App Store Submission)
```
App Transport Security:            [ ] 0/1 completed
Privacy Nutrition Label:           [ ] 0/1 completed
Sign in with Apple:                [ ] 0/1 completed
Privacy Policy URL:                [ ] 0/1 completed

TOTAL APP STORE REQUIREMENTS:      0/4 (0%)
```

### Verification Tests (Before Launch)
```
Authentication Tests:              [ ] 0/5 passed
Authorization Tests (RLS):         [ ] 0/5 passed
Input Validation Tests:            [ ] 0/5 passed
Rate Limiting Tests:               [ ] 0/4 passed
AI Security Tests:                 [ ] 0/4 passed

TOTAL VERIFICATION TESTS:          0/23 passed (0%)
```

---

## 🎯 Recommended Implementation Order

**Week 1 (Days 1-3): Core Security**
1. Enable RLS on all tables (1 day)
2. Test RLS with multiple users (0.5 day)
3. JWT verification middleware (0.5 day)
4. Secure token storage (iOS Keychain) (0.5 day)
5. HTTPS enforcement (configuration only)

**Week 1 (Days 4-5): Input & API Security**
6. File upload validation (0.5 day)
7. Rate limiting (basic) (0.5 day)
8. Error handling without leaks (0.5 day)

**Week 2 (Days 1-2): AI Security**
9. Prompt injection prevention (0.5 day)
10. AI rate limiting (0.5 day)
11. AI output validation (0.5 day)

**Week 2 (Days 3-5): Compliance & Monitoring**
12. Data export endpoint (0.5 day)
13. Account deletion (1 day)
14. COPPA age verification (0.5 day)
15. Security event logging (0.5 day)
16. Privacy policy (1 day)

**Week 3 (Day 1): Final Review**
17. Run all verification tests
18. Final security audit
19. Self-assessment penetration testing

---

## 📞 Security Contacts

**Primary Contact:**
Jack (Product Owner)
Email: jack@weave.app
Response SLA: 15 min (P1), 1 hour (P2)

**Security Email:**
security@weave.app
(Monitored by: Jack + Engineering Team)

**Escalation:**
- P1 (Critical): Immediate phone call + email
- P2 (High): Email within 1 hour
- P3 (Medium): Email within 4 hours
- P4 (Low): Email within 24 hours

---

**Status:** Ready for Implementation
**Estimated Time to Alpha-Ready:** 2-3 weeks (with 1 full-time engineer)
**Next Update:** After Sprint 1 completion

**Notes:**
This checklist is a living document. Update completion status as tasks are finished. Mark items with `[x]` when completed and add completion date.

**Example:**
```markdown
- [x] Enable RLS on user_profiles (Completed: 2025-12-20)
- [x] Test RLS with 3 test users (Completed: 2025-12-20)
```
