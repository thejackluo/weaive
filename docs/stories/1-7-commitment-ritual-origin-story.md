# Story 1.7: Commitment Ritual & Origin Story (First Bind)

Status: not-started

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **new user who has completed identity trait selection**,
I want to **mark the beginning of my transformation in a personal, meaningful way**,
So that **I feel emotionally committed and can look back on where I started**.

## Overview / Rationale

This ritual transforms onboarding inputs into a permanent origin story.

By reflecting the user's:
- current struggles (from Story 1.2),
- desired future traits (from Story 1.6),
- and spoken commitment,

Weave creates a time-stamped narrative artifact that:
- reinforces identity change,
- anchors motivation,
- and gives future progress emotional context.

This first Bind is symbolic, narrative, and irreversible.

## Flow Summary

- **Trigger:** After completion of Primary struggle selection (1–2) and Dream self trait selection (3) in Story 1.6
- **Total Screens:** 3
- **Total Time:** ~45–60 seconds
- **Transitions:** Story 1.6 (Identity Traits) → Story 1.7 (Origin Story) → Story 1.8 (First Needle)

## Acceptance Criteria

### Screen 1: Narrative Validation (Current → Future)

#### Purpose
Mirror the user's internal story back to them and establish the transformation arc.

#### Dynamic UI Copy (Template)
- **Title:** "This is where your story shifts."
- **Body (auto-generated using user data):**
  - "Right now, you're feeling [primary struggle 1] (and [primary struggle 2], if selected)."
  - "But you want to become someone who is [dream trait 1], [dream trait 2], and [dream trait 3]."
  - "Weave is how you bridge that gap — one action at a time."
- **Primary CTA:** "Take the first step →"

#### Acceptance Criteria
- [ ] Copy dynamically injects 1–2 struggles (plain-language labels) and 3 future traits
- [ ] Copy must read naturally (use conjunction logic: "and" for 2 struggles)
- [ ] No user input on this screen
- [ ] Completion time < 10 seconds
- [ ] Track event: `origin_story_intro_viewed`

#### Technical Notes
- Dynamic text generation (non-AI, deterministic)
- Use liquid-glass card design from design system
- Retrieve struggles from Story 1.2 onboarding state
- Retrieve traits from Story 1.6 onboarding state

---

### Screen 2: Origin Story Capture (Commitment Bind)

#### Purpose
Create a digital postcard from Day 0 — a multi-modal record of the user's starting point. This is the first Bind.

#### UI Copy
- **Title:** "Let's make this moment official."
- **Body:**
  - "Take a photo and record a short voice note saying:"
  - *"Today is [date]. My name is [name]. I'm starting this because I'm [struggle], and I'm committed to becoming someone who is [dream traits]."*
  - "This will be saved as the beginning of your story — something you can return to anytime."
- **Primary CTA:** "Complete Bind"

#### Interaction Requirements
- [ ] Camera capture (required)
  - Use Expo Camera API
  - Front-facing camera by default
  - Show preview before accepting
- [ ] Voice note capture (required)
  - Use Expo Audio API
  - Max duration: 60 seconds
  - Show recording indicator (timer + waveform animation)
  - Playback button to review before submitting
- [ ] Display a preview card showing:
  - User photo (thumbnail, rounded)
  - Auto-formatted text summary:
    - "From: [struggle(s)]"
    - "To: [dream traits]"
  - Voice note playback button
- [ ] User confirms once before final submission

#### Acceptance Criteria
- [ ] User must complete both photo and voice note
- [ ] If user tries to proceed without both, show error: "Please complete both photo and voice note"
- [ ] Preview of the "origin story card" is shown before final submit
- [ ] On submit:
  - Bind is marked complete
  - Origin story artifact is created
  - User proceeds immediately to success screen
- [ ] Handle camera/microphone permission requests gracefully
- [ ] Show fallback UI if permissions denied (allow text-only mode as escape hatch)
- [ ] Track event: `origin_story_created`

#### Data Requirements

Create a persistent Origin Story Record:
- `origin_created_at` (TIMESTAMPTZ)
- `starting_struggles[]` (TEXT ARRAY)
- `dream_traits[]` (TEXT ARRAY)
- `photo_asset_id` (UUID → references `captures` table)
- `voice_note_asset_id` (UUID → references `captures` table)
- `origin_summary_text` (TEXT - auto-generated summary)

Associate this with:
- first `bind_instance` (with special type: `origin_story`)
- `subtask_completions` table (append-only event log)
- user history/log

#### Technical Notes
- Media stored securely in Supabase Storage
- Origin Story is immutable (no UPDATE or DELETE, retention forever)
- Photo: upload to `user-captures/[user_id]/origin-photo.jpg`
- Voice note: upload to `user-captures/[user_id]/origin-voice.m4a`
- Max photo size: 10MB
- Max voice note: 5MB

---

### Screen 3: Completion & Reinforcement

#### Purpose
Deliver emotional reinforcement and define what a Bind means.

#### UI / Animation
- Weave animation evolves from blank → first form (thread appears)
- Confetti or subtle glow animation
- Level bar animates from 0 → 1
- Show "Origin Bind Complete" badge unlocking

#### UI Copy
- **Title:** "This is your beginning."
- **Body:**
  - "You've created your origin story."
  - "Every Bind you complete builds on this moment — strengthening your Weave and the person you're becoming."
- **Primary CTA:** "Continue →"

#### Acceptance Criteria
- [ ] Animation plays once (cannot skip)
- [ ] CTA advances to next onboarding step (Story 1.8: First Needle)
- [ ] No additional explanation required
- [ ] Completion time < 6 seconds
- [ ] Track event: `origin_bind_completed`
- [ ] Set database values:
  - `first_bind_completed_at` (TIMESTAMPTZ)
  - `user level = 1` (user_profiles.level)
  - `onboarding_origin_completed = true`

#### Technical Notes
- Reuse Weave animation from Story 1.6 (thread weaving animation)
- Use design system confetti component
- Ensure smooth transition to Story 1.8

---

## Where This Lives in the App (Critical)

The Origin Story should be accessible from:
- **Weave profile / identity section** (dedicated "Origin Story" card)
- **Timeline / history view** (pinned at the top as Day 0)
- **"Look how far you've come" moments** (Day 10, Day 30, Day 90 milestone screens)

It is **never edited** — only revisited.

---

## Success Criteria

- [ ] ≥ 95% completion rate (users who reach this screen complete it)
- [ ] Users can articulate what a "Bind" is without explanation after this screen
- [ ] Increased emotional attachment to early progress (measured via Day 7 retention)
- [ ] Stronger long-term retention driven by narrative continuity (measured via Day 30 retention)
- [ ] Average completion time: 45-60 seconds
- [ ] Low back-navigation rate (<5% of users go back to Story 1.6)

---

## Error Handling

### Camera Permission Denied
- Show alert: "Camera access is needed to capture your origin photo. Please enable it in Settings."
- Offer "Skip for now" option (allows text-only mode)
- Track event: `origin_camera_permission_denied`

### Microphone Permission Denied
- Show alert: "Microphone access is needed to record your commitment. Please enable it in Settings."
- Offer "Skip for now" option (allows text-only mode)
- Track event: `origin_microphone_permission_denied`

### Upload Failure
- Show error: "Upload failed. Please check your connection and try again."
- Retry button
- Track event: `origin_upload_failed`

### Text-Only Fallback Mode
- If both camera and microphone permissions are denied:
- Allow user to type a commitment statement (min 50 characters)
- Track event: `origin_text_only_mode`

---

## Technical Architecture

### API Endpoints

**POST /api/onboarding/origin-story**

Request body:
```json
{
  "user_id": "uuid",
  "struggles": ["consistency", "action"],
  "dream_traits": ["decisive_action", "consistent_effort", "clear_direction"],
  "photo_uri": "file://local-path",
  "voice_note_uri": "file://local-path",
  "origin_text": "auto-generated summary"
}
```

Response:
```json
{
  "data": {
    "origin_story_id": "uuid",
    "bind_instance_id": "uuid",
    "photo_url": "https://...",
    "voice_note_url": "https://...",
    "created_at": "2025-12-19T10:00:00Z"
  },
  "meta": {
    "timestamp": "2025-12-19T10:00:00Z"
  }
}
```

### Database Schema Updates

**New table: `origin_stories`**

```sql
CREATE TABLE origin_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  starting_struggles TEXT[] NOT NULL,
  dream_traits TEXT[] NOT NULL,
  photo_asset_id UUID REFERENCES captures(id),
  voice_note_asset_id UUID REFERENCES captures(id),
  origin_summary_text TEXT NOT NULL,
  bind_instance_id UUID REFERENCES subtask_instances(id),
  UNIQUE(user_id) -- Only one origin story per user
);

-- Enable RLS
ALTER TABLE origin_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view/create their own origin story
CREATE POLICY "users_manage_own_origin_story" ON origin_stories
  FOR ALL
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
  ));
```

**Update `user_profiles` table:**

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_bind_completed_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_origin_completed BOOLEAN DEFAULT false;
```

---

## Design System Components Used

- `Card` (variant="glass") for all screens
- `Text` (variant="displayLg" for titles, "bodyLg" for body text)
- `Button` (variant="primary") for CTAs
- `AnimatedWeave` (custom animation component)
- `ConfettiAnimation` (celebration animation)
- Camera and Audio capture components (to be built with Expo APIs)

---

## Testing Checklist

### Manual Testing
- [ ] Test full happy path: Screen 1 → Screen 2 (photo + voice) → Screen 3 → Story 1.8
- [ ] Test camera permission flow (allow, deny, skip)
- [ ] Test microphone permission flow (allow, deny, skip)
- [ ] Test text-only fallback mode
- [ ] Test upload failure + retry
- [ ] Test with 1 struggle vs 2 struggles (dynamic text generation)
- [ ] Test back navigation (should show confirmation dialog if on Screen 2 with captured media)
- [ ] Verify origin story appears in profile section
- [ ] Verify origin story appears in timeline (Day 0)

### Automated Testing
- [ ] Unit test: Dynamic text generation with different struggle/trait combinations
- [ ] Unit test: Origin story data validation
- [ ] Integration test: Full origin story creation flow (mock camera/audio)
- [ ] API test: POST /api/onboarding/origin-story endpoint
- [ ] Database test: RLS policies on `origin_stories` table

---

## Dependencies

### Story Dependencies
- **Depends on:** Story 1.2 (Emotional State Selection) - provides struggles
- **Depends on:** Story 1.6 (Identity Traits) - provides dream traits and user name
- **Leads to:** Story 1.8 (First Needle) - goal definition

### Technical Dependencies
- Expo Camera (camera capture)
- Expo Audio (voice recording)
- Supabase Storage (media uploads)
- Design system animations (Weave animation, confetti)

---

## Implementation Priority

**Priority:** M (Must Have)

**Estimated Story Points:** 5 pts

**Rationale:** This is a critical emotional anchor point in the onboarding flow. Creates strong user commitment and provides narrative context for the entire app experience.

---

## Related Files

- PRD: `docs/prd/epic-1-onboarding-optimized-hybrid-flow.md` (lines 430-577)
- Epics: `docs/epics.md` (FR-1.7)
- Architecture: `docs/architecture/core-architectural-decisions.md`
- Design System: `docs/dev/design-system-guide.md`

---

## Notes

- This story introduces the concept of "Binds" to users in a memorable, emotional way
- The origin story is immutable and serves as a permanent anchor point
- This is the FIRST bind completion (symbolic), distinct from later goal-based binds
- Consider A/B testing photo+voice vs. text-only to measure impact on retention
