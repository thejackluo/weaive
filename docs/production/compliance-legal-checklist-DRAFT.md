# ⚖️ Compliance & Legal Checklist

**Purpose:** Ensure Weave meets all legal and regulatory requirements before public launch.

**Target Audience:** Legal Team, Product Manager, Tech Lead

**Status:** 🔄 Draft (Requires legal review before production)

---

## ⚠️ IMPORTANT DISCLAIMER

**This checklist is NOT legal advice.** It provides general guidance based on common app compliance requirements. You MUST consult with a qualified attorney before public launch to ensure compliance with:
- US laws (COPPA, CCPA, etc.)
- EU laws (GDPR)
- Platform policies (Apple App Store, Google Play)
- Industry-specific regulations

---

## 📋 Quick Reference

### Must Complete Before Launch
1. ✅ Privacy Policy (drafted and published)
2. ✅ Terms of Service (drafted and published)
3. ✅ User Consent Flow (implemented in app)
4. ✅ Data Deletion Endpoint (implemented)
5. ✅ Age Gate (13+ restriction)
6. ✅ App Store Privacy Nutrition Label (completed)

### Can Defer to Post-Launch (if low user count)
- ⏸ GDPR Data Processing Agreement (required if EU users)
- ⏸ CCPA Do Not Sell disclosure (required if CA users)
- ⏸ COPPA compliance (required if targeting <13)

---

## 1️⃣ Privacy Policy

### 1.1 Requirements

**Must include:**
- [ ] What data is collected
- [ ] How data is used
- [ ] Third-party services that receive data
- [ ] Data retention policy
- [ ] User rights (access, deletion, export)
- [ ] Contact information (support email)
- [ ] Last updated date

### 1.2 Data Collection Disclosure

**Data Weave Collects:**

| Data Type | Purpose | Retention | Third-Party Access |
|-----------|---------|-----------|-------------------|
| **Email address** | Authentication, notifications | Until account deleted | Supabase (auth) |
| **Name** | Personalization | Until account deleted | None |
| **Age/Birth date** | Age verification (13+) | Until account deleted | None |
| **Goals & subtasks** | Core product functionality | Until account deleted | None |
| **Completions** | Progress tracking | Until account deleted | None |
| **Journal entries** | Reflection feature | Until account deleted | None |
| **Proof photos** | Completion verification | Until account deleted | Supabase (storage) |
| **Voice recordings** | Transcription (optional) | Deleted after processing | AssemblyAI (processing) |
| **AI chat history** | Coaching feature | Until account deleted | OpenAI, Anthropic |
| **Device info** | Crash reporting, analytics | 90 days | Sentry, LogRocket |
| **Usage analytics** | Product improvement | 90 days | PostHog (future) |

### 1.3 Third-Party Services Disclosure

**Services that process user data:**

1. **Supabase (Database & Auth)**
   - Purpose: User authentication, database storage
   - Data: Email, password hash, all user content
   - Location: US (configurable)
   - Privacy Policy: https://supabase.com/privacy

2. **OpenAI (AI Generation)**
   - Purpose: AI-generated daily triads, journal feedback
   - Data: Goals, completions, journal entries (context)
   - Location: US
   - Privacy Policy: https://openai.com/policies/privacy-policy
   - **Important:** User data NOT used for model training (API policy)

3. **Anthropic (AI Generation)**
   - Purpose: AI coaching chat (Dream Self)
   - Data: Identity document, chat messages
   - Location: US
   - Privacy Policy: https://www.anthropic.com/privacy

4. **AWS Bedrock (AI Generation)**
   - Purpose: Claude AI via Amazon
   - Data: Same as Anthropic (alternative provider)
   - Location: us-east-1
   - Privacy Policy: https://aws.amazon.com/privacy/

5. **AssemblyAI (Voice Transcription)**
   - Purpose: Convert voice to text (optional feature)
   - Data: Audio recordings (deleted after transcription)
   - Location: US
   - Privacy Policy: https://www.assemblyai.com/legal/privacy-policy

6. **Sentry (Error Tracking)**
   - Purpose: Crash reports, error monitoring
   - Data: Device info, stack traces (no PII)
   - Location: US
   - Privacy Policy: https://sentry.io/privacy/

7. **LogRocket (Session Replay)**
   - Purpose: Debug user issues
   - Data: Screen recordings, network requests (PII masked)
   - Location: US
   - Privacy Policy: https://logrocket.com/privacy/

### 1.4 User Rights

**GDPR & CCPA Rights (must support):**

- [ ] **Right to Access** - User can download all their data
  - Endpoint: `GET /api/users/me/export` (returns JSON file)

- [ ] **Right to Deletion** - User can delete account and all data
  - Endpoint: `DELETE /api/users/me` (soft delete, 30-day retention)
  - In-app: Settings → Account → Delete Account

- [ ] **Right to Rectification** - User can edit their data
  - All user content is editable in the app

- [ ] **Right to Portability** - User can export data in machine-readable format
  - Export format: JSON (includes goals, completions, journals, identity doc)

- [ ] **Right to Object** - User can opt out of data processing
  - Equivalent to account deletion (no processing without account)

### 1.5 Privacy Policy Accessibility

- [ ] Privacy Policy published at public URL (e.g., https://weave.app/privacy)
- [ ] Privacy Policy accessible in app: Settings → Legal → Privacy Policy
- [ ] Privacy Policy URL in App Store Connect metadata
- [ ] Privacy Policy reviewed and approved by legal counsel
- [ ] Last updated date clearly visible

**Template Resources:**
- [Termly Privacy Policy Generator](https://termly.io/products/privacy-policy-generator/)
- [Privacy Policies (Free Templates)](https://www.privacypolicies.com/)
- [iubenda (Paid, Legal-Backed)](https://www.iubenda.com/)

---

## 2️⃣ Terms of Service

### 2.1 Requirements

**Must include:**
- [ ] User eligibility (age 13+)
- [ ] Account responsibilities
- [ ] Acceptable use policy
- [ ] Prohibited activities
- [ ] Intellectual property rights
- [ ] Limitation of liability
- [ ] Dispute resolution (arbitration clause)
- [ ] Termination conditions
- [ ] Governing law and jurisdiction
- [ ] Last updated date

### 2.2 Key Terms to Include

**User Eligibility:**
- Minimum age: 13 years old (COPPA compliance)
- Users under 13 must have parental consent (or block entirely)
- Users must provide accurate information

**Acceptable Use:**
- Use app for personal goal tracking only
- Do not share account credentials
- Do not attempt to reverse engineer the app
- Do not abuse AI features (spam, inappropriate content)

**Prohibited Activities:**
- Harassment or abuse of other users (if social features added)
- Uploading illegal content (e.g., illegal drugs in proof photos)
- Attempting to hack or exploit the service
- Commercial use without permission

**Limitation of Liability:**
- Weave is not a medical or mental health service
- User is responsible for their own health and safety
- Weave not liable for user decisions based on AI advice
- Maximum liability: Amount paid for subscription (if paid app)

**Termination:**
- Weave can terminate account for Terms violations
- User can terminate account anytime (account deletion)
- Termination does not affect data deletion rights

### 2.3 Terms of Service Accessibility

- [ ] Terms published at public URL (e.g., https://weave.app/terms)
- [ ] Terms accessible in app: Settings → Legal → Terms of Service
- [ ] Terms URL in App Store Connect metadata
- [ ] Terms reviewed and approved by legal counsel
- [ ] Last updated date clearly visible

---

## 3️⃣ User Consent & Onboarding

### 3.1 Consent Flow (Must Implement)

**During signup:**
1. [ ] Display clear consent screen before account creation
2. [ ] User must actively check boxes (no pre-checked boxes)
3. [ ] Link to Privacy Policy and Terms of Service
4. [ ] Store consent timestamp in database (`user_profiles.consent_accepted_at`)

**Example consent screen:**
```
Before you continue:

[ ] I have read and agree to the Terms of Service
[ ] I have read and understand the Privacy Policy
[ ] I am at least 13 years old
[ ] I consent to my data being processed as described in the Privacy Policy

[View Terms] [View Privacy Policy]

[Continue]  (only enabled if all boxes checked)
```

### 3.2 Consent Data Storage

**Store in `user_profiles` table:**
```sql
ALTER TABLE user_profiles ADD COLUMN consent_accepted_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN consent_ip_address TEXT;
ALTER TABLE user_profiles ADD COLUMN consent_version TEXT;  -- e.g., "v1.0"
```

**Why:** Proves user consent if legal dispute arises.

### 3.3 Consent Withdrawal

- [ ] User can withdraw consent in Settings → Account → Withdraw Consent
- [ ] Withdrawing consent triggers account deletion (30-day retention)
- [ ] Log consent withdrawal in database (`user_profiles.consent_withdrawn_at`)

---

## 4️⃣ Age Verification (COPPA Compliance)

### 4.1 Age Gate Implementation

**Requirements:**
- [ ] Ask for birth date during signup
- [ ] Block users under 13 years old
- [ ] Store birth date in database (`user_profiles.birth_date`)
- [ ] Do NOT allow fake birth dates (validate realistic age)

**Example age gate:**
```
What's your birth date?

[MM] / [DD] / [YYYY]

(We need this to comply with age restrictions. You must be 13 or older to use Weave.)

[Continue]
```

**Validation logic:**
```typescript
const age = calculateAge(birthDate);
if (age < 13) {
  // Block signup
  showError("You must be 13 or older to use Weave.");
  return;
}
```

### 4.2 Parental Consent (If Targeting <13)

**⚠️ NOT RECOMMENDED** - Very complex compliance requirements.

If you decide to allow users under 13:
- [ ] Implement verifiable parental consent (credit card, ID verification)
- [ ] Provide parent access to child's data
- [ ] Allow parent to delete child's account
- [ ] Limit data collection to strict minimum
- [ ] Comply with COPPA's full requirements

**Recommendation:** Block users under 13 entirely (simpler compliance).

---

## 5️⃣ Data Protection (GDPR & CCPA)

### 5.1 Data Deletion (Right to Erasure)

**Implementation:**
- [ ] `DELETE /api/users/me` endpoint (soft delete)
- [ ] Soft delete: Set `user_profiles.deleted_at = NOW()`
- [ ] 30-day retention period (allow recovery if accidental)
- [ ] After 30 days: Hard delete all user data (scheduled job)

**What to delete:**
```sql
-- After 30 days, hard delete:
DELETE FROM ai_runs WHERE user_id = ?;
DELETE FROM ai_artifacts WHERE user_id = ?;
DELETE FROM triad_tasks WHERE user_id = ?;
DELETE FROM daily_aggregates WHERE user_id = ?;
DELETE FROM journal_entries WHERE user_id = ?;
DELETE FROM captures WHERE user_id = ?;
DELETE FROM subtask_completions WHERE user_id = ?;
DELETE FROM subtask_instances WHERE user_id = ?;
DELETE FROM subtask_templates WHERE user_id = ?;
DELETE FROM goals WHERE user_id = ?;
DELETE FROM identity_docs WHERE user_id = ?;
DELETE FROM user_profiles WHERE id = ?;

-- Also delete files in Supabase Storage
DELETE FROM storage.objects WHERE bucket_id = 'captures' AND owner = ?;
```

### 5.2 Data Export (Right to Portability)

**Implementation:**
- [ ] `GET /api/users/me/export` endpoint
- [ ] Returns JSON file with ALL user data
- [ ] Include: goals, completions, journals, identity doc, photos (URLs)
- [ ] Trigger: Settings → Account → Export My Data

**Example export format:**
```json
{
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "goals": [...],
  "subtasks": [...],
  "completions": [...],
  "journal_entries": [...],
  "identity_document": {...},
  "ai_chat_history": [...],
  "proof_photos": [
    "https://supabase.co/storage/v1/object/public/captures/user123/photo1.jpg"
  ]
}
```

### 5.3 Data Retention Policy

**Define clear retention periods:**

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| **User account** | Until deleted by user | Active use |
| **Goals, completions, journals** | Until deleted by user | Core product data |
| **Soft-deleted accounts** | 30 days after deletion | Allow accidental recovery |
| **Error logs (Sentry)** | 90 days | Debugging |
| **Session replays (LogRocket)** | 30 days | Debugging |
| **AI run logs** | Until account deleted | Cost tracking |
| **Voice recordings** | Deleted after transcription | Privacy |

### 5.4 Data Processing Agreement (DPA)

**If you have EU users:**
- [ ] Sign DPA with Supabase (data processor)
- [ ] Sign DPA with OpenAI (if applicable)
- [ ] Sign DPA with Anthropic (if applicable)
- [ ] Ensure all vendors are GDPR-compliant

**Where to find DPAs:**
- Supabase: https://supabase.com/legal/dpa
- OpenAI: https://openai.com/policies/data-processing-addendum
- Anthropic: Contact Anthropic sales

---

## 6️⃣ App Store Compliance

### 6.1 Apple App Store Privacy Nutrition Label

**Data Collection Categories (must disclose in App Store Connect):**

**Data Linked to User:**
- [ ] Contact Info: Email address (for account)
- [ ] User Content: Goals, journal entries, photos, voice (if used)
- [ ] Identifiers: User ID (internal)
- [ ] Usage Data: Product interactions (analytics)

**Data Not Collected:**
- [ ] Location (Weave does not use location)
- [ ] Precise Location (not used)
- [ ] Contacts (not used)
- [ ] Health & Fitness (not directly tracked)

**Data Used for Tracking:**
- [ ] None (Weave does NOT use third-party tracking for ads)

**Third-Party Data:**
- [ ] List all third-party SDKs: Supabase, Sentry, LogRocket, Expo
- [ ] Disclose data shared with each SDK

### 6.2 App Store Review Guidelines

**Must comply with:**
- [ ] 1.1 Objectionable Content - No offensive content
- [ ] 2.1 App Completeness - App must be fully functional
- [ ] 2.3 Accurate Metadata - Description matches app functionality
- [ ] 3.1 Payments - If paid app, use in-app purchase
- [ ] 4.0 Design - Follow Human Interface Guidelines
- [ ] 5.1 Privacy - Privacy Policy accessible, data handling disclosed

**Common rejection reasons:**
- Missing Privacy Policy URL
- Privacy Policy does not match data collection
- App crashes on launch
- Incomplete app (placeholder screens)
- Misleading screenshots or description

### 6.3 Google Play Store Compliance

**Similar requirements:**
- [ ] Data Safety form (similar to Privacy Nutrition Label)
- [ ] Target API Level 33+ (Android 13)
- [ ] Privacy Policy URL required
- [ ] Terms of Service URL required

---

## 7️⃣ Security & Data Protection

### 7.1 Encryption

- [ ] Data encrypted in transit (HTTPS)
- [ ] Data encrypted at rest (Supabase default)
- [ ] Passwords hashed (Supabase Auth default: bcrypt)
- [ ] JWT tokens secure (HS256, strong secret)

### 7.2 Access Control

- [ ] Row Level Security (RLS) enabled on all user tables
- [ ] Users can only access their own data
- [ ] Admin access logged and audited (future)
- [ ] No plaintext passwords in logs or database

### 7.3 Vulnerability Management

- [ ] Dependency scanning (Dependabot, Snyk)
- [ ] Security patches applied promptly
- [ ] Penetration testing (annual, if budget allows)
- [ ] Bug bounty program (future, post-MVP)

---

## 8️⃣ Incident Response

### 8.1 Data Breach Notification

**If data breach occurs:**
1. [ ] Identify scope (what data, how many users)
2. [ ] Contain breach (patch vulnerability)
3. [ ] Notify affected users within 72 hours (GDPR requirement)
4. [ ] Report to authorities (if required by law)
5. [ ] Document incident (for legal record)

**Notification template:**
```
Subject: Important Security Notice

Dear Weave User,

We are writing to inform you of a security incident that may have affected your account.

What happened: [Brief description]
What data was involved: [Specific data types]
What we're doing: [Steps taken]
What you should do: [User actions, e.g., reset password]

We sincerely apologize for this incident and are committed to protecting your data.

Contact us: support@weave.app

Weave Security Team
```

### 8.2 Incident Response Team

- [ ] Designate incident response lead (Tech Lead)
- [ ] Define escalation process (e.g., critical vs. non-critical)
- [ ] Document incident response playbook (separate doc)
- [ ] Test incident response annually

---

## 9️⃣ Marketing & Communications

### 9.1 Email Compliance (CAN-SPAM)

**If sending marketing emails:**
- [ ] Include physical address in footer
- [ ] Provide unsubscribe link (one-click)
- [ ] Honor unsubscribe requests within 10 days
- [ ] Clearly identify email as advertisement
- [ ] Use accurate "From" name and subject line

**Transactional emails exempt:**
- Account confirmation
- Password reset
- Payment receipts
- Service notifications

### 9.2 Push Notification Consent

- [ ] Ask for push notification permission (iOS prompt)
- [ ] Allow user to disable notifications in Settings
- [ ] Respect notification preferences (do not spam)
- [ ] Do NOT use notifications for ads (unless explicit consent)

---

## 🔟 Accessibility (Optional, Recommended)

### 10.1 WCAG 2.1 Compliance (Level AA)

**Recommended for accessibility:**
- [ ] Color contrast ratio >= 4.5:1 (text)
- [ ] Keyboard navigation support (mobile: VoiceOver)
- [ ] Screen reader labels on all interactive elements
- [ ] Form inputs have labels
- [ ] Error messages are descriptive

### 10.2 Platform Accessibility Features

- [ ] iOS VoiceOver support (accessibility labels)
- [ ] Android TalkBack support
- [ ] Dynamic Type support (text scaling)
- [ ] High contrast mode support (future)

---

## ✅ Final Compliance Checklist

**Before public launch:**

### Legal Documents
- [ ] Privacy Policy drafted and reviewed by attorney
- [ ] Terms of Service drafted and reviewed by attorney
- [ ] Privacy Policy published at public URL
- [ ] Terms of Service published at public URL
- [ ] Both accessible in app (Settings → Legal)

### User Consent
- [ ] Consent flow implemented in signup
- [ ] Consent stored in database (timestamp, version)
- [ ] User can withdraw consent (triggers account deletion)

### Age Verification
- [ ] Age gate implemented (birth date collection)
- [ ] Users under 13 blocked
- [ ] Age stored in database

### Data Rights
- [ ] Data deletion endpoint implemented (`DELETE /api/users/me`)
- [ ] Data export endpoint implemented (`GET /api/users/me/export`)
- [ ] 30-day soft delete retention period
- [ ] Scheduled job for hard deletion (after 30 days)

### App Store Compliance
- [ ] Apple Privacy Nutrition Label completed
- [ ] Google Play Data Safety form completed
- [ ] All third-party SDKs disclosed
- [ ] App Store Review Guidelines reviewed

### Security
- [ ] RLS enabled on all user tables
- [ ] JWT secret is strong (256-bit entropy)
- [ ] No secrets in code or Git history
- [ ] Vulnerability scanning enabled

### Incident Response
- [ ] Data breach notification process documented
- [ ] Incident response team designated
- [ ] Security contact email (security@weave.app)

---

## 📞 Legal Resources

### Attorney Consultation
- [ ] Schedule consultation with attorney (before launch)
- [ ] Review Privacy Policy and Terms of Service
- [ ] Discuss GDPR/CCPA compliance
- [ ] Review app store compliance

### Legal Service Providers
- [Termly](https://termly.io/) - Privacy Policy & Terms generator
- [Priori Legal](https://www.priorilegal.com/) - On-demand legal services
- [UpCounsel](https://www.upcounsel.com/) - Business attorneys

### Regulatory Resources
- [FTC COPPA Guidelines](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)
- [GDPR Official Text](https://gdpr-info.eu/)
- [CCPA Official Site](https://oag.ca.gov/privacy/ccpa)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**Last Updated:** 2025-12-23
**Owner:** Legal Team + Product Manager
**Next Review:** Before public launch (consult attorney)
**Status:** ⚠️ Draft - Requires legal review
