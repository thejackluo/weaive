# Story 9.3: App Store Compliance

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 8 story points
**Status:** Ready for Development

---

## User Story

**As a** product manager
**I want to** ensure Weave complies with all App Store guidelines
**So that** the app is approved for publication without delays

---

## Acceptance Criteria

### Legal Documents

**Privacy Policy:**
- [ ] Draft comprehensive privacy policy covering:
  - Data collection (user profiles, goals, journal entries, images, audio)
  - AI usage (OpenAI, Anthropic, Google AI for processing)
  - Third-party services (Supabase storage, Sentry error tracking, LogRocket sessions)
  - User rights (GDPR: access, deletion, portability; COPPA if users <13)
  - Data retention and deletion policies
- [ ] Legal review (use attorney or LegalZoom template: $300-500)
- [ ] Publish privacy policy on public website (e.g., weave.app/privacy or GitHub Pages)
- [ ] Add link to privacy policy in app settings (required by Apple)

**Terms of Service:**
- [ ] Draft terms of service covering:
  - User agreements and acceptable use policy
  - Liability disclaimers (AI-generated content accuracy)
  - Intellectual property rights (user content vs app content)
  - Dispute resolution and arbitration
  - Subscription terms (free trial, billing, cancellation)
- [ ] Legal review
- [ ] Publish ToS on public website (e.g., weave.app/terms)
- [ ] Add link to ToS in app settings and during signup

### App Store Connect Setup

**Apple Developer Account:**
- [ ] Create Apple Developer account ($99/year)
- [ ] Complete identity verification
- [ ] Accept Apple Developer Program License Agreement

**App Store Connect:**
- [ ] Set up App Store Connect account
- [ ] Create app record:
  - App name: "Weave"
  - Bundle ID: `com.weaveapp.weave`
  - Primary language: English
  - Category: Productivity (or Health & Fitness)

**App Metadata:**
- [ ] Write app subtitle (30 characters max): "10-day identity transformation"
- [ ] Write app description (4000 characters max):
  - Highlight value prop: "Turn vague goals into daily wins"
  - Explain key features: Goals, Daily Binds, AI Coach, Progress Tracking
  - Mention 10-day transformation journey
- [ ] Select keywords (100 characters max): "goals, habits, productivity, ai, coaching"
- [ ] Write promotional text (170 characters): "Launch today with 10-day free trial"
- [ ] Set age rating: 12+ (user-generated content, journaling visible to AI)

**Screenshots & Media:**
- [ ] Design and upload 6.7" iPhone screenshots (6 required):
  1. Welcome screen (value prop)
  2. Goal creation (show AI assistance)
  3. Daily Binds (Thread home)
  4. Journal entry (reflection flow)
  5. Progress dashboard (heat map, charts)
  6. AI Coach chat
- [ ] Design and upload 5.5" iPhone screenshots (6 required)
- [ ] Optional: Create app preview video (30 seconds showing core flow)

### Compliance Checklist

**App Store Review Guidelines:**
- [ ] Review full guidelines: https://developer.apple.com/app-store/review/guidelines/
- [ ] Verify compliance with key sections:
  - 1.1: No objectionable content (hate speech, violence)
  - 2.1: App completeness (all features functional, no placeholders)
  - 2.3.1: Accurate metadata (screenshots match actual app)
  - 3.1.1: IAP for digital content (use Apple IAP, not external links)
  - 5.1.1: Privacy policy visible in app + App Store Connect
- [ ] Ensure AI-generated content is clearly labeled
- [ ] No misleading claims about AI capabilities

**Privacy Compliance:**
- [ ] GDPR compliance (for EU users):
  - Data access request handling
  - Right to be forgotten (account deletion)
  - Data portability (export user data)
- [ ] COPPA compliance (if users under 13):
  - Parental consent required
  - Minimal data collection
  - No behavioral advertising

---

## Technical Notes

### Legal Document Templates
- **LegalZoom:** $300-500 for privacy policy + ToS templates
- **TermsFeed:** Free generator (basic) or $150 (premium)
- **Attorney:** $500-1000 for custom review
- **Recommendation:** Use LegalZoom or TermsFeed, then have attorney review

### Hosting Privacy Policy/ToS
**Option 1: GitHub Pages (Free)**
```bash
# Create docs site
mkdir -p docs/legal
echo "# Privacy Policy\n\n[content]" > docs/legal/privacy.md
echo "# Terms of Service\n\n[content]" > docs/legal/terms.md

# Enable GitHub Pages in repo settings
# Access at: https://weaveapp.github.io/weave/legal/privacy
```

**Option 2: Simple static site (weave.app/privacy)**
- Host on Vercel/Netlify (free)
- Single HTML page with privacy policy and ToS

### App Store Connect Metadata Tips
- **Subtitle:** Focus on outcome, not features ("10-day identity transformation")
- **Description:** Lead with problem → solution → transformation
- **Keywords:** Research competitors, use App Store optimization tools
- **Screenshots:** Show real app UI, avoid mockups (Apple rejects fake screenshots)

### Age Rating Guidance
- **4+:** No user-generated content visible, no AI processing personal data
- **12+:** User-generated content (journal) visible to AI, appropriate for 12+
- **17+:** Only if mature themes in user content (not applicable to Weave)

---

## Dependencies

**Requires:**
- Marketing team or designer (for screenshots and app preview video)
- Legal review (attorney or template service)

**Unblocks:**
- Story 9.8 (App Store Submission - requires metadata + legal docs)

---

## Definition of Done

- [ ] Privacy policy drafted, reviewed, and published
- [ ] Terms of service drafted, reviewed, and published
- [ ] Apple Developer account created and paid ($99)
- [ ] App Store Connect app record created
- [ ] All metadata fields filled in (name, description, keywords, etc.)
- [ ] 12 screenshots uploaded (6 for 6.7", 6 for 5.5")
- [ ] App preview video uploaded (optional but recommended)
- [ ] Age rating set correctly
- [ ] Compliance checklist reviewed and verified
- [ ] Code reviewed and approved

---

## Testing Checklist

- [ ] Privacy policy link works from app settings
- [ ] Terms of service link works from signup flow
- [ ] App Store Connect metadata preview looks correct
- [ ] Screenshots accurately represent app UI
- [ ] Age rating matches app content
- [ ] Legal review confirms GDPR/COPPA compliance

---

## Resources

- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **LegalZoom Privacy Policy:** https://www.legalzoom.com/
- **TermsFeed Generator:** https://www.termsfeed.com/
- **App Store Connect:** https://appstoreconnect.apple.com/
- **App Store Optimization Guide:** https://developer.apple.com/app-store/product-page/

---
