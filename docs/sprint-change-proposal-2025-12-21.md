# Sprint Change Proposal: Complete Wireframe Requirements

**Date:** 2025-12-21
**Author:** Eddie (User) + Claude
**Status:** Ready for Documentation Update
**Purpose:** Capture complete wireframe-based implementation requirements for all main screens

---

## Overview

This document captures the complete requirements gathered from wireframe review sessions. It provides detailed specifications for all user-facing pages, interaction patterns, and navigation flows that should be incorporated into the existing page documentation (`docs/pages/`).

---

## 1. Thread Page (Epic 3 + 4)

### Screen Layout

**Header (Top):**
- **Left:** Streak counter + Weave logo (e.g., "2 🔥")
- **Center:** Greeting with user's name (e.g., "good evening, eddie.")
- **Right:** Profile button (circular avatar)

**Calendar Widget:**
- Week view (Su-Sa)
- Current day highlighted (white pill shape)
- Shows dates (e.g., 23, 24, 25...)

**AI Insight Card:**
- Weave icon + daily contextual message
- Example: "finish up the figma wireframes for the app. you said you were gonna do it so don't embarrass yourself :)"
- **Interactive:** Clickable card opens Weave AI modal with this insight as context
- **Visual indicator:** Subtle styling to show it's tappable (slight shadow, hover state)

**Your Needles Section:**
- Header: "Your Needles"
- Up to 3 needle cards displayed
- **Each needle card shows:**
  - Color-coded vertical bar (left edge: blue, green, red)
  - Needle title (e.g., "Get Ripped")
  - "Why" motivation (e.g., "Why: to auafarm mfs")
  - Completion status (right side: "0/2 Completed")
  - Dropdown arrow (chevron down)

**Needle Dropdown Behavior:**
- **Default:** All needles visible, collapsed
- **When expanded:**
  - Selected needle expands to show binds
  - **Other needles hide completely** (only expanded needle visible)
  - Chevron changes to up arrow
  - Binds appear below with circular checkboxes:
    - Uncompleted: Empty circle + bind title + subtitle (e.g., "5x Per Week. Today's one of them.")
    - Completed: Checkmark + different visual style (grayed out or checkmark)

**Bind Interaction:**
- **Tap bind checkbox or card** → Opens Bind Screen (see section below)

**Your Thread Section:**
- Header: "Your Thread"
- Daily Check-In card:
  - Red dot indicator (top-left)
  - Timer: "23:59 left to complete"
  - "Daily Check-In" title (center)
  - "Begin" button (white pill button)
- **Timer behavior:**
  - Counts down to midnight (end of day)
  - **Flexible window:** After midnight, show "Yesterday's Check-In" prompt
  - Streak continues if completed within 24 hours of previous check-in
  - Use US-5.5 streak resilience: 3 consecutive days recovers 1 missed day
- **"Begin" button** → Opens Daily Reflection flow (Epic 4)

**Bottom Navigation:**
- **Thread** (left, active state)
- **Weave AI** (center, Weave logo icon)
- **Track** (right, bar chart icon)

---

### Bind Screen (Start Bind)

**Wireframe Reference:** Image 4 (Workout screen)

**Header:**
- Back button (left)
- Bind title: "Workout" (center)
- Week completion calendar (below title)
  - Shows 7 days (M-S with dates)
  - Completed days: checkmark in circle
  - Uncompleted days: empty dark circle

**AI Context Message:**
- Weave icon + motivational context
- Example: "Remember, you are doing this to get ripped so you can auafarm some mfs. Lock in."

**Choose Accountability Section:**
- Header: "Choose Accountability"
- Two large buttons side-by-side:
  - **Timer** (left, primary white button with clock icon)
  - **Photo** (right, dark button with camera icon)

**Weave Level Progress:**
- Weave character icon (left)
- Text: "Completing this bind will strengthen your weave!"
- Level indicator: "Level 2"
- Progress bar (horizontal, partially filled)

**Start Bind Button:**
- Large white pill button at bottom
- Text: "Start Bind"

**Bottom Navigation:** (same as Thread page)

**Interaction Flow:**
1. User taps "Timer" or "Photo" (or both)
2. **Timer flow:** Opens Pomodoro-style timer with presets (15/25/45/60 min)
   - Focus mode UI, minimal distractions
   - Runs in background
   - Completion triggers next step
3. **Photo flow:** Opens camera for capture
4. **After accountability chosen:**
   - User taps "Start Bind"
   - On completion → Confetti animation
   - Show affirmation: "You're getting closer to [Goal Name]!"
   - Show Weave level progress bar increase
   - Prompt for optional description (280 char max, skippable)
   - Return to Thread with updated status

---

## 2. Dashboard Page (Epic 2 + 5)

### Screen Layout

**Header (Top):**
- **Left:** "Level 2" text
- **Center:** Weave character visualization (animated mathematical curve)
  - Changes in real-time as user completes binds/reflections
  - Uses US-5.4 progression: Thread → Strand → Cord → Braid → Weave
  - **NOT interactive** (no tap action)
- **Right Top:** Streak counter (e.g., "2 🔥")
- **Right Below:** Profile button (circular avatar)

**Your Needles Section:**
- Up to 3 needle cards displayed
- **Each needle card shows:**
  - Color-coded vertical bar (left edge)
  - Needle title (e.g., "Get Ripped")
  - "Why" motivation (smaller text below title)
  - Chevron/arrow (right side)

**Needle Arrow Click Behavior:**
- **Opens:** Combined View/Edit Needle Screen (see section below)
- This screen shows US-2.2 (View Goal Details) + US-2.4 (Edit Needle) combined

**Overall Consistency Section:**
- Header: "Overall Consistency"
- Large percentage: "69%" (with trend indicator: "+17%" in green)
- Timeframe dropdown (right): "7d" with chevron
  - Options: 7 days, 2 weeks, 1 month, 90 days
- **Filter tabs:**
  - Overall | Needle | Bind | Thread
  - Active tab highlighted (white pill)
- **Visualization:**
  - **7 days:** Vertical table with days as rows, binds as columns, checkmarks for completion
  - **>7 days:** GitHub-style heat map (squares colored by intensity)
    - Darker green = higher completion %
    - Lighter/gray = lower completion %
- **AI Insight card** (below graph):
  - Weave icon + contextual message
  - Example: "you were super small five months ago. now look at you :)"
  - **Clickable:** Opens Weave AI modal

**Consistency Filter Details:**
1. **Overall:** Tracks all active binds + daily reflections
   - Shows % of total potential completions in timeframe
2. **Needle:** Shows one needle at a time
   - **Pagination dots** at bottom (swipe to see other needles)
   - Displays: Needle name, "Why", consistency % with trend
   - Graph shows all binds for that needle
3. **Bind:** Shows one bind at a time
   - Horizontal scrollable/searchable chips to select bind
   - Graph shows only that bind's completion pattern
4. **Thread:** Shows daily reflection consistency only
   - Single row: "Daily Reflection" with completion checkmarks

**Average Fulfillment Section:**
- Header: "Average Fulfillment"
- Large number: "7.7" (with trend indicator)
- Timeframe dropdown (right): "7d"
- **Line chart:**
  - X-axis: Days (Mon, Tue, Wed...)
  - Y-axis: Fulfillment score (0-10)
  - Line with data points
  - 7-day rolling average (smoothed line)
- **AI Insight card** (below chart):
  - Clickable, opens Weave AI modal

**History Section:**
- Header: "History"
- **Filter chips (scrollable):**
  - Days | Weeks | Months
  - Needles | Binds | Photos | Threads
- Search box: "🔍 Search..."
- **Empty state:** "No entries found"
- **When populated:** List of entries with dates
  - Tap entry → Opens Daily Record Screen (read-only)

**Bottom Navigation:** (same as Thread page)

---

### Graph Interaction Patterns

**Consistency Graph:**
- **Tap on day:** Shows popup with date + completion summary
  - Example: "Dec 25 - 3/4 binds completed"
  - Tap popup → Opens Daily Record Screen
- **7-day view:** Tap checkmark/cell → Same popup behavior

**Average Fulfillment Chart:**
- **Drag across chart:** Vertical bar follows finger/cursor
  - Popup shows: Date + fulfillment score (e.g., "Dec 25 - 8.2")
  - Tap popup → Opens Daily Record Screen

**Both graphs link to:** Standardized Daily Record Screen (see section below)

---

### Combined View/Edit Needle Screen

**Purpose:** Single screen for US-2.2 (View Goal Details) + US-2.4 (Edit Needle)

**Header:**
- Back button (left)
- Needle title (center) - becomes editable in edit mode
- "Edit" / "Done" toggle button (right)

**View Mode (Default):**

1. **Needle Title Section:**
   - Large title (e.g., "Get Ripped")
   - Color-coded bar accent

2. **Why Section:**
   - Label: "Why this matters"
   - Text: User's motivation (e.g., "to auafarm mfs")

3. **Stats Row:**
   - 7-day consistency: "73%"
   - Total completions: "24"
   - Current streak: "12 days"

4. **Milestones (Q-goals) Section:**
   - Header: "Milestones"
   - Expandable list with progress bars:
     - "Reach 180 lbs" - 60% progress bar
     - "Bench 225 lbs" - 30% progress bar
   - Each milestone shows: Title, current value, target value, progress %

5. **Binds Section:**
   - Header: "Your Binds"
   - List of active binds for this needle:
     - Bind title (e.g., "Workout")
     - Frequency (e.g., "5x per week")
     - Recent completion pattern (mini calendar or checkmarks)
     - Today's status: ✓ or incomplete

6. **Archive Needle Button:**
   - Bottom of screen
   - Red/warning style
   - Shows confirmation: "Are you sure? You can reactivate later."

**Edit Mode (After tapping "Edit"):**
- All fields become editable:
  - Needle title → Text input
  - Why section → Text area (multi-line)
  - Milestones → Add/edit/delete buttons next to each
  - Binds → Add/edit/delete buttons, drag handles to reorder
- **"Ask AI to Help" floating button** (bottom-right, circular FAB)
  - Tap → Opens Weave AI modal
  - User can ask: "Add a morning stretch bind" or "Adjust workout frequency"
  - AI suggests changes, user approves/edits
- "Done" button saves changes

**Adding New Needle:**
- From Dashboard, if <3 needles: Show "Add Needle" button
- Opens this screen with blank fields
- Edit mode enabled by default
- "Ask AI to Help" available for AI-assisted creation (US-2.3)

**Navigation:**
- From Dashboard needle card → This screen (View mode)
- From this screen "Ask AI" → Weave AI modal overlay
- Back button → Returns to Dashboard

---

### Daily Record Screen (Standardized)

**Purpose:** Read-only view of a specific day's activity. Accessed from:
- History section (tap entry)
- Consistency graph (tap day popup)
- Fulfillment chart (tap day popup)

**Layout:**

**Header:**
- Back button (left)
- Date: "Tuesday, December 25" (center)

**Sections:**

1. **Daily Stats Summary:**
   - Binds completed: "3/4 (75%)"
   - Fulfillment score: "8.2/10"
   - Streak status: "Day 12 of streak"

2. **Completed Binds:**
   - List of binds completed that day:
     - Bind title
     - Needle it belongs to
     - Time completed
     - Proof indicator (timer/photo icon if present)
   - Tap bind → Show proof details (timer duration, photo viewer)

3. **Daily Reflection:**
   - Fulfillment score (large number with /10)
   - Journal entry text (read-only)
   - Tomorrow's intention (if user set one)

4. **Missed Binds (if any):**
   - List of scheduled binds not completed
   - Grayed out style

**Interaction:**
- All content is **read-only** (no editing past data)
- Tap proof indicators → View timer details or photos
- Back button → Returns to previous screen

---

## 3. Weave AI Modal (Epic 6)

### Concept
iOS Siri-style modal overlay that appears over current screen. Keeps user in context while chatting with AI.

**Trigger Points:**
1. Bottom nav center button (Weave icon)
2. Clicking any AI insight card (Thread, Dashboard)
3. "Ask AI to Help" button (Needle Edit screen)
4. Any other AI interaction points

---

### Modal Layout

**Backdrop:**
- Heavy blur effect (iOS Siri-style)
- Dark overlay (40-50% opacity)
- User can vaguely see screen content behind
- Tap outside modal → Does NOT dismiss (require explicit X button)

**Modal Container:**
- Centered on screen (doesn't cover entire screen)
- Rounded corners (large radius, ~24px)
- Dark background (matches app theme)

**Top Section:**
- **Weave Character Visualization:**
  - User's current Weave mathematical shape (animated)
  - Same visual as Dashboard header (Level 2 → Strand pattern)
  - Subtle animation/pulse while AI is "thinking"
- **X Button (top-right corner):**
  - Dismisses modal
  - Returns to previous screen

**Chat Area (Middle, scrollable):**
- Message bubbles:
  - **Weave messages:** Left-aligned, Weave icon avatar
  - **User messages:** Right-aligned, user's profile photo avatar
- Message styling:
  - Weave: Dark bubble with white text
  - User: Lighter bubble (blue/accent color)
- **Streaming effect:** Weave responses appear word-by-word (typewriter)
- **Scroll behavior:** Auto-scroll to latest message

**Quick Action Chips (above input):**
- Horizontal scrollable row of chips:
  - "Plan my day"
  - "I'm stuck"
  - "Edit my goal"
  - "Explain this bind"
- **Collapsible:** Arrow or X button to hide/show
  - Default: Shown on first open
  - Hidden after user sends first message
  - User can toggle visibility with arrow button
- Tap chip → Auto-fills message + sends

**Input Area (Bottom):**
- Text input field:
  - Placeholder: "Start typing..."
  - Multi-line support (grows as user types)
  - Max ~4 lines, then scrollable
- **Microphone button (right of input):**
  - Tap to toggle voice input
  - While recording:
    - Red dot indicator
    - Voice waveform visualization (animated)
    - Tap again to stop recording
  - Speech-to-text: Converts to text in input field
  - User can edit before sending
- **Send button:** Paper plane icon, appears when text is entered

---

### Context Handling

**When opened from AI Insight click:**
1. Insight text appears as first message in chat (Weave message)
2. Weave also references it in next message:
   - Example: "You wanted to talk about [insight topic]. Let's dive in..."
3. User can see full context and continue conversation

**When opened from "Ask AI to Help" (Needle Edit):**
1. First message: "I'm looking at your [Needle Name] goal. How can I help?"
2. User asks to modify binds/milestones
3. AI suggests changes
4. User approves → Changes apply to needle
5. Modal shows confirmation: "Updated [Needle Name]!"

**When opened from Bottom Nav (cold start):**
1. Weave greets user contextually:
   - "Hey eddie, how's your day going?"
   - Or references recent activity: "I see you crushed your workout earlier! 💪"
2. Quick action chips visible
3. User can start any conversation

---

### Chat History

**Behavior:**
- Each modal session is a **fresh chat** (starts blank or with context)
- Previous conversations saved to database
- **Accessing past chats:**
  - Settings → "Weave Chat History" (from Profile & Settings)
  - Opens list of past conversations (by date/topic)
  - Tap conversation → Opens modal with that history loaded

**Rate Limiting:**
- 10 AI messages per hour per user (enforced at API level)
- Show warning when approaching limit
- Block when limit reached: "You've reached your chat limit. Try again in [X] minutes."

---

## 4. Profile & Settings Page (Epic 7 + 8)

### Purpose
iOS-style settings page following Apple Settings.app patterns. Single scrollable page with grouped sections.

**Access:** Tap profile button (top-right on Thread or Dashboard)

---

### Screen Layout

**Profile Header (Top, non-scrollable):**
- **Circular profile photo** (large, centered)
  - Tap to change photo
  - Upload from camera or gallery
- **Name** (below photo, centered)
- **Email** (below name, smaller text)
- **Level badge** (e.g., "Level 2 - Strand") + Streak (e.g., "12 day streak 🔥")

---

**Scrollable Content (Grouped List Sections):**

### Section 1: Account
**Style:** iOS grouped list with chevrons

- **Edit Profile** →
  - Name (text input)
  - Email (text input)
  - Profile photo (upload button)
  - Save button

- **Identity Document** →
  - View archetype (from onboarding)
  - Dream self description (read-only or editable?)
  - Motivations & failure modes
  - Constraints & demographics

- **Subscription** →
  - Current plan badge: "Free" / "Pro" / "Max"
  - Plan comparison table:
    | Feature | Free | Pro | Max |
    |---------|------|-----|-----|
    | Goals | 1 | 3 | 5 |
    | AI Chat | Limited | Unlimited | Unlimited |
    | Insights | Basic | Advanced | Premium |
  - **Upgrade button** (if not on Max)
  - Link to App Store subscription management
  - Cancel subscription info

---

### Section 2: Notifications
**Style:** Toggle switches + time pickers

- **Enable Notifications** (master toggle)
  - If off, all below are disabled

- **Morning Intention** (toggle)
  - Time picker: "8:00 AM" (tap to change)
  - Subtitle: "Daily plan and yesterday's recap"

- **Bind Reminders** (toggle)
  - Subtitle: "Gentle reminders for scheduled binds"

- **Evening Reflection** (toggle)
  - Time picker: "9:00 PM"
  - Subtitle: "Daily check-in prompt"

- **Streak Recovery** (toggle)
  - Subtitle: "Compassionate nudges after missing days"

- **Quiet Hours** (toggle)
  - If on, show time range picker:
    - Start: "10:00 PM"
    - End: "7:00 AM"
  - Subtitle: "No notifications during this window"

**Note:** "Max 5 notifications per day" enforced automatically (not a setting)

---

### Section 3: Preferences

- **Strictness Mode** (segmented control or picker)
  - Options: None / Normal / Strict
  - Subtitle: "Controls warnings when editing goals"
  - **None:** No warnings
  - **Normal:** Show impact summary
  - **Strict:** Require justification text

- **Theme** (if we add dark mode toggle)
  - Options: Auto / Light / Dark

---

### Section 4: Data & Privacy

- **Export My Data** →
  - Button: "Download Data"
  - Generates JSON with all user data
  - Opens share sheet to save/send

- **Weave Chat History** →
  - List of past AI conversations
  - Each entry: Date + first message preview
  - Tap → Opens Weave AI modal with that history

---

### Section 5: Support

- **Help & FAQ** →
  - In-app FAQ section (expandable list)
  - Topics: "How do streaks work?", "What are Q-goals?", etc.

- **Contact Support** →
  - Email link: support@weaveapp.com
  - Or in-app form

- **Rate App** →
  - Opens App Store rating dialog
  - (Prompt after 7 active days - US-8.5)

- **Version** (non-tappable)
  - Gray text: "Version 1.0.0 (Build 42)"

---

### Section 6: Account Actions

- **Logout** (red text)
  - Confirmation dialog: "Are you sure you want to logout?"
  - Clears local session
  - Returns to login screen

- **Delete Account** (red text)
  - Multi-step confirmation:
    1. Warning: "This will permanently delete all your data"
    2. Require re-authentication (Face ID / password)
    3. Type "DELETE" to confirm
  - Soft delete: 30-day grace period before hard delete
  - Email sent: "Your account will be deleted in 30 days. Log back in to cancel."

---

## 5. Additional Screens & Flows

### Daily Reflection Flow (Epic 4)

**Triggered by:** "Begin" button on Thread → Daily Check-In card

**Flow (not fully wireframed, using Epic 4 requirements):**

1. **Recap Screen (US-4.2):**
   - Shows today's completed binds
   - Summary of day's activity
   - AI-generated recap (optional, respects user preferences)

2. **Fulfillment Score (US-4.1):**
   - Prompt: "How fulfilled did you feel today?"
   - 1-10 scale (slider or number picker)
   - Visual: Emojis or colors to match scores

3. **Journal Entry (US-4.1):**
   - "What went well today?"
   - "What was hard?"
   - "What's your intention for tomorrow?"
   - Text areas (optional, trust-based)

4. **AI Feedback (US-4.3):**
   - AI generates feedback based on:
     - Fulfillment score
     - Journal entry
     - Completion patterns
   - User can edit AI feedback (US-4.4)
   - Save and return to Thread

---

## 6. Navigation Flow Summary

```
Bottom Navigation (Global):
├── Thread (left)
│   ├── Tap Needle → Expand/collapse (hide others)
│   ├── Tap Bind → Bind Screen
│   ├── Tap AI Insight → Weave AI Modal
│   ├── Tap Daily Check-In "Begin" → Daily Reflection Flow
│   └── Tap Profile → Profile & Settings
│
├── Weave AI (center)
│   └── Opens Weave AI Modal (fresh chat)
│
└── Track/Dashboard (right)
    ├── Tap Needle → Combined View/Edit Needle Screen
    │   └── Tap "Ask AI" → Weave AI Modal
    ├── Tap AI Insight → Weave AI Modal
    ├── Tap Graph Day → Popup → Daily Record Screen
    ├── Tap History Entry → Daily Record Screen
    └── Tap Profile → Profile & Settings

Profile & Settings:
├── Edit Profile
├── Identity Document
├── Subscription → App Store
├── Notification Settings
├── Data Export
├── Chat History → List → Weave AI Modal (with history)
├── Help & Support
└── Logout / Delete Account
```

---

## 7. Key Interaction Patterns

### Consistency Measurement Rules

**Overall Consistency:**
- Tracks all active binds + daily reflections
- Formula: `(completed / total_potential) * 100`
- Example: 3 binds/day + 1 reflection = 4 total
  - Completed: 3 binds + 1 reflection = 4
  - Total potential over 7 days: 4 * 7 = 28
  - Consistency: (28 / 28) * 100 = 100%

**Needle Consistency:**
- Filter to one needle's binds only
- Pagination dots: Swipe to see other needles
- Shows consistency % for that needle's binds

**Bind Consistency:**
- Filter to single bind
- Horizontal scrollable chips to select bind
- Search functionality
- Shows that bind's completion pattern

**Thread Consistency:**
- Daily reflection completion only
- Shows as single row: "Daily Reflection"

### Visual States

**Completed Bind:**
- Checkmark in circle
- Text may be grayed out or strikethrough
- Visual distinction from incomplete

**Incomplete Bind:**
- Empty circle
- Full color text
- Subtitle shows frequency (e.g., "5x Per Week")

**Streak Indicator:**
- Fire emoji + number (e.g., "12 🔥")
- Shown in header of Thread and Dashboard

**Level Badge:**
- Text format: "Level [number]" (e.g., "Level 2")
- Corresponds to Weave character visual

---

## 8. Design System Components Needed

Based on wireframes, we need these components:

**Existing (use from design system):**
- Button (primary, secondary, ghost, danger variants)
- Card (glass, elevated variants)
- Text (displayLg, displayMd, bodyMd, labelSm variants)
- Input (text input, text area)
- Toggle/Switch

**New/Custom Components:**
- **NeedleCard** - Collapsible card with colored bar, dropdown arrow
- **BindItem** - Checkbox + title + subtitle + completion status
- **ConsistencyGraph** - GitHub-style heat map for >7 days
- **ConsistencyTable** - 7-day table with checkmarks
- **FulfillmentChart** - Line chart with draggable interaction
- **WeaveCharacter** - Animated mathematical curve (SVG or Lottie)
- **AIInsightCard** - Clickable card with Weave icon + message
- **CalendarWidget** - Week view with date highlighting
- **WeaveModal** - Siri-style modal overlay with chat
- **ChatBubble** - Message bubble (left/right aligned)
- **VoiceWaveform** - Animated waveform for voice input
- **DailyCheckInCard** - Timer + Begin button card
- **ProgressBar** - Horizontal progress bar with label
- **TimePicker** - iOS-style time picker
- **SegmentedControl** - For filter tabs (Overall/Needle/Bind/Thread)

---

## 9. Technical Implementation Notes

### State Management Strategy

**TanStack Query (Server State):**
- Goals (needles)
- Binds (subtask_instances, subtask_completions)
- Daily aggregates (consistency data)
- Journal entries (fulfillment scores)
- AI chat history
- User profile

**Zustand (UI State):**
- Expanded needle ID (which needle is open on Thread)
- Selected consistency filter (Overall/Needle/Bind/Thread)
- Selected timeframe (7d, 2w, 1m, 90d)
- Modal visibility (Weave AI modal open/closed)
- Quick action chips collapsed state

**useState (Local Component State):**
- Form inputs (text fields, pickers)
- Timer state (running, paused, elapsed)
- Voice recording state
- Selected day on graph (for popup)

### Data Flow for Consistency Graphs

**Overall Consistency:**
1. Query `daily_aggregates` for date range
2. For each day:
   - Count completed binds: `binds_completed`
   - Count scheduled binds: `binds_scheduled`
   - Check daily reflection: `has_reflection` (boolean)
3. Calculate: `((binds_completed + (has_reflection ? 1 : 0)) / (binds_scheduled + 1)) * 100`
4. Render heat map or table

**Needle Consistency:**
1. Query `subtask_instances` filtered by `goal_id`
2. Query `subtask_completions` for those instances
3. Calculate per-needle consistency
4. Support pagination (3 needles, swipeable)

**Bind Consistency:**
1. Query `subtask_instances` filtered by `subtask_template_id`
2. Query `subtask_completions` for those instances
3. Show single bind's pattern
4. Scrollable chip selector for bind selection

**Thread Consistency:**
1. Query `journal_entries` for date range
2. Count days with entries
3. Calculate: `(days_with_entries / total_days) * 100`

### AI Integration Points

**AI Insight Generation:**
- **Daily insights** (Thread, Dashboard): Generated by AI cron job
  - Stored in `ai_artifacts` (type: 'daily_insight')
  - Refreshed once per day per user
  - Context: Recent completions, streaks, patterns
- **Weekly insights** (Dashboard bottom): US-6.4
  - Generated Sunday night per timezone
  - Stored in `ai_artifacts` (type: 'weekly_insight')

**Chat Context:**
- When opening Weave AI from insight:
  - Pass insight text as `context_insight_id`
  - Load insight from `ai_artifacts`
  - Display as first message + reference in Weave response
- When opening from "Ask AI to Help":
  - Pass needle context: `context_goal_id`
  - Load needle data (title, why, binds, milestones)
  - AI knows user is editing this goal

**Rate Limiting:**
- 10 AI chat messages per hour per user
- Tracked in backend via `ai_runs` table
- Frontend shows warning at 8/10, blocks at 10/10

### Performance Optimizations

**Weave Character Animation:**
- Use Lottie or SVG animations
- Preload next level's animation
- Cache rendered frames

**Consistency Heat Map:**
- Only render visible days (virtual scrolling for 90-day view)
- Use CSS Grid for layout
- Lazy load past data

**Chat History:**
- Paginate old conversations (load 10 at a time)
- Infinite scroll for long chats
- Cache recent conversations locally

**Image/Proof Loading:**
- Lazy load proof images in Daily Record
- Thumbnail → full size on tap
- Cache images locally

---

## 10. Open Questions / Decisions Needed

### 1. Needle Management
- **Adding 4th needle when at limit:** Show error message? Or prompt to archive one first?
- **Archiving flow:** Immediate archive, or "Are you sure?" dialog?
- **Reactivating archived needles:** From where? Profile settings? History section?

### 2. Consistency Calculation Edge Cases
- **Partial day completion:** If user completes 2/3 binds, is that day 66% or 0%?
  - **Recommendation:** Use percentage (66%) for granular tracking
- **Missed reflection only:** If all binds complete but no reflection, consistency = 75% (3/4)?
  - **Recommendation:** Yes, weighted equally

### 3. Daily Record Screen - Proof Viewing
- **Timer proof:** Show start time, end time, duration?
- **Photo proof:** Full-screen viewer? Swipeable gallery if multiple photos?
- **Audio proof (future):** Playback controls?

### 4. AI Chat History Management
- **Max chat history stored:** 30 days? 90 days? Forever?
- **Deletion:** Can users delete individual conversations?
- **Search:** Can users search chat history?

### 5. Profile Photo
- **Default avatar:** Initials? Generic icon? Random color?
- **Allowed formats:** JPEG, PNG only? Max file size?

### 6. Voice Chat Transcription
- **Which speech-to-text service:** iOS native? OpenAI Whisper? Google Cloud?
- **Error handling:** If transcription fails, allow manual typing?
- **Language support:** English only for MVP?

---

## 11. Success Metrics

After implementing these screens, we should track:

**Engagement:**
- Daily active users (DAU)
- Thread page visits per day
- Bind completion rate
- Daily reflection completion rate

**Feature Usage:**
- Weave AI modal open rate
- AI insight click-through rate
- Consistency graph interactions (taps on days)
- Needle edits per week

**Retention:**
- 7-day retention
- 30-day retention
- Streak lengths (median, 90th percentile)

**AI Performance:**
- AI response quality (user feedback: helpful/not helpful)
- AI suggestion acceptance rate (when editing needles)
- Voice chat usage vs. text chat

---

## Next Steps

1. **Update Page Documentation:**
   - Use this document to update `docs/pages/thread-page.md`
   - Update `docs/pages/dashboard-page.md`
   - Update `docs/pages/weave-ai-page.md`
   - Update `docs/pages/profile-settings.md`

2. **Create New Page Documents:**
   - `docs/pages/needle-view-edit-page.md` (Combined needle screen)
   - `docs/pages/daily-record-page.md` (Standardized day view)

3. **Update Implementation Strategy:**
   - Add wireframe-specific implementation notes to `docs/implementation-strategy.md`
   - Add component list and technical patterns

4. **Use Correct-Course Workflow:**
   - Run `bmad:bmm:workflows:correct-course` to incorporate all changes
   - Validate against existing epic requirements
   - Identify any gaps or conflicts

5. **Begin Implementation:**
   - Start with Thread page (most foundational)
   - Build design system components as needed
   - Test each interaction pattern thoroughly

---

**Document Status:** ✅ Ready for Review & Documentation Update
**Next Action:** Run correct-course workflow to update all page documentation
