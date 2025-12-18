# Thread Home

## Wireframe Information

**Name:** thread-home
**Created:** 2025-12-17
**Purpose:** The primary dashboard screen where users view their active goals ("Needles") with associated habits ("Binds"), review their daily streak, access AI insights, record daily moments, and complete daily check-ins.

## Visual Overview

The Thread Home screen serves as the main hub of the Weave app, presenting a dark-themed interface with a streak counter, weekly calendar navigation, AI-generated daily insights, and organized sections for goals and daily activities. The screen uses a single-column scrollable layout with clear visual hierarchy through section headers, color-coded goal indicators, and prominent call-to-action cards.

The interface balances information density with clarity by using card-based components, adequate spacing, and strategic use of accent colors (blue, green, red) to differentiate between goals. A persistent bottom navigation bar provides quick access to Track analytics and the Weave AI assistant.

## UI Components

**Header Section:**
- **Streak counter badge:** Small square badge with number "2" and Weave symbol icon, displaying consecutive days of completed daily check-ins
- **Greeting text:** Personalized time-based greeting "good evening, eddie." in white text
- **User profile icon:** Circular avatar icon in top-right corner for account access

**Calendar Week View:**
- **Day cells:** Seven day cells showing Su-Sa (23-29)
- **Current day highlight:** "Tu 25" displayed in white pill-shaped container with rounded corners
- **Inactive days:** Gray text for non-selected days

**AI Insight Card:**
- **Container:** Dark rounded rectangle card
- **Icon:** Small Weave app icon in top-left of card
- **Insight text:** AI-generated daily insight/reminder "finish up the figma wireframes for the app. you said you were gonna do it so don't embarrass yourself :)"
- **Purpose:** Provides personalized motivation, reminders, or coaching based on user's goals and behavior

**Your Needles Section:**
- **Section header:** "Your Needles" in white text
- **Goal card 1 (Get Ripped):**
  - Blue vertical accent bar on left edge
  - Goal title "Get Ripped"
  - Subtitle "Why: to aurafarm m's" in gray
  - Completion status "0/2 Completed" in top-right (tracks completed binds)
  - Chevron/dropdown indicator on right side (expands to show binds)

- **Goal card 2 (Make $1 Million):**
  - Green vertical accent bar on left edge
  - Goal title "Make $1 Million in Profit this Year"
  - Subtitle "Why: to live a free life that's not constrained to a job"
  - Completion status "0/1 completed"
  - Chevron/dropdown indicator on right side (expands to show binds)

- **Goal card 3 (Have a group):**
  - Red vertical accent bar on left edge
  - Goal title "Have a group of people I love"
  - Subtitle "Why: what else is the point of aurafaming and freedom if there isn't anyone else to experience it with"
  - Completion status "0/1 Completed"
  - Chevron/dropdown indicator on right side (expands to show binds)

**Your Thread Section:**
- **Section header:** "Your Thread" in white text
- **Document card:**
  - Dark background with rounded corners
  - "Document" label
  - Plus icon in circle (add/record action)
  - Purpose: Record moments/media from the day (photos, notes, audio captures)

- **Daily Check-In card:**
  - Dark background with rounded corners
  - "Daily Check-In" label
  - Red dot indicator in top-right (shows incomplete status)
  - Time remaining text "23:59 left to complete"
  - White "Begin" button with rounded corners
  - Purpose: Complete daily reflection and journaling

**Bottom Navigation Bar:**
- **Thread tab (active):** Icon with crossed sparkles/stars, label "Thread", currently highlighted (Thread Home page)
- **Center AI button:** Icon with crossed tools/wrench symbol - taps to pop up Weave AI assistant
- **Track tab:** Chart/analytics bar icon, label "Track" - navigates to Track home page

## Layout Structure

**Overall pattern:** Single-column vertical scroll layout with fixed header and bottom navigation

**Visual hierarchy:**
1. Header area (streak + greeting + calendar) - Fixed at top
2. AI insight card - Full width, prominent placement
3. Goals section ("Your Needles") - Stacked expandable cards with consistent spacing
4. Actions section ("Your Thread") - Horizontal two-card layout
5. Bottom navigation - Fixed at bottom

**Key sections:**
- **Header container:** Houses streak counter, greeting, profile icon, calendar
- **Content area:** Scrollable region with AI insight, goals (needles), and thread cards
- **Navigation container:** Fixed bottom bar with Thread, AI, and Track access

**Spacing patterns:**
- Consistent card margins and padding
- Adequate spacing between sections (approximately 24-32px)
- Tight spacing within cards for related information
- Generous padding around interactive elements

## User Interactions

**Tap targets:**
- **Streak counter badge** → View streak history or streak details
- **Profile icon** → Navigate to profile/settings
- **Day cells in calendar** → Jump to specific date view (shows historical data for that day)
- **AI insight card** → Potentially expand message, view more insights, or interact with AI
- **Goal cards (Needles)** → **Expand/collapse dropdown to reveal related Binds (habits)** for that goal
- **Chevron icons on goal cards** → Toggle expand/collapse of Binds list
- **Document card plus icon** → Record a moment (capture photo, note, or audio from the day)
- **Daily Check-In "Begin" button** → Start daily reflection/journaling workflow
- **Thread tab** → Already on this screen (active state)
- **Center AI button** → Pop up Weave AI assistant overlay/modal
- **Track tab** → Navigate to Track home page (progress analytics and visualization)

**Gesture interactions:**
- **Swipe down** → Pull-to-refresh to update completions and AI insights
- **Scroll** → Vertical scrolling through needles and content

**Navigation actions:**
- Tapping goal card expands to show Binds (habits) inline
- "Begin" button initiates Daily Check-In workflow
- Bottom nav AI button opens AI assistant overlay
- Bottom nav tabs switch between Thread Home and Track Home
- Profile icon opens account/settings screen

**Dropdown behavior:**
- Goal cards act as accordion dropdowns
- Tapping expands card to reveal list of associated Binds
- Each Bind likely has checkbox for marking complete
- Completion counts update in real-time as Binds are checked off

## User Flow

**Entry Point:**
- App launch (if user is authenticated and onboarding is complete)
- After completing onboarding
- Returning from Track page via bottom navigation
- Closing AI assistant returns to this screen
- Completing Daily Check-In returns here

**Exit Points:**
- Profile/Settings (via profile icon)
- Historical date view (via calendar day selection)
- Expanded goal view with Binds (inline expansion)
- Moment capture flow (via Document card)
- Daily Check-In flow (via "Begin" button)
- Weave AI assistant (via center button)
- Track home page (via Track tab)
- Streak details (via streak counter)

**Role in App:**
This is the primary home screen and central hub of Weave. It's the main dashboard where users:
- Monitor their consistency streak
- Review active goals (Needles) and mark habits (Binds) as complete
- Receive daily AI insights and motivation
- Access daily check-in workflow
- Record moments and captures from their day
- See real-time progress on goal completion

Users return to this screen multiple times daily to log completions and check progress.

## States & Variations

**Empty State:**
- If no goals exist: "Your Needles" section shows empty state with prompt to create first Needle
- If streak is 0: Streak counter shows "0" with encouragement to start streak
- New users see onboarding-focused AI insights

**Needle Expanded State:**
- Goal card expands vertically when tapped
- Reveals list of Binds (consistent habits) associated with that goal
- Each Bind shows:
  - Checkbox for marking complete
  - Bind title/description
  - Possibly completion status or streak info
- Completion count updates as Binds are checked

**Needle Collapsed State (Current View):**
- Default state shown in wireframe
- Shows summary info: title, why statement, completion ratio
- Chevron indicates expandable state

**Loading State:**
- Streak counter loads quickly
- Calendar and greeting appear immediately
- Goals and completion counts might show skeleton screens briefly
- AI insight might have subtle loading indicator

**Time-based Variations:**
- **Greeting changes:** "good morning", "good afternoon", "good evening", "good night"
- **Streak counter updates:** Increments at midnight when daily check-in is completed consecutively
- **Daily Check-In countdown:** Timer resets at midnight (23:59:59 → 23:59:58)
- **Calendar auto-advances:** Current date highlight moves daily
- **AI insight refreshes:** New insight generated daily based on recent behavior

**Conditional Elements:**
- **Red dot on Daily Check-In:** Only visible when check-in is incomplete for the day
- **AI insight content:** Varies based on user's archetype, dream self, goal progress, and recent activity
- **Completion counts:** Update in real-time as users complete Binds throughout the day
- **Number of Needles:** Shows 1-3 active goals (max 3 per MVP spec)
- **Streak counter appearance:** Might have special visual treatment for milestones (7 days, 30 days, etc.)

**Completion States:**
- **Daily Check-In completed:** Red dot disappears, card might show "Completed" with checkmark
- **All Binds complete for day:** Goals might show visual celebration (100% completion)
- **Streak achieved:** Streak counter increments the next day

## Design Notes

**Color coding strategy:**
- Each Needle (goal) has a unique accent color (blue, green, red) for quick visual identification
- Accent colors carry through to Bind items when expanded
- Color consistency across related screens

**Streak visualization:**
- Prominent placement in top-left establishes importance of consistency
- Weave symbol reinforces brand identity
- Number is clear and readable

**Dark theme implementation:**
- Primary background: True black (#000000) or very dark gray
- Card backgrounds: Slightly lighter dark gray (#1A1A1A or similar) for contrast
- White text for primary content, gray for secondary

**Accessibility considerations:**
- Adequate contrast ratios between text and backgrounds (WCAG AA compliant)
- Tap targets appear sufficiently large (minimum 44x44pt)
- Color is not the only differentiator (text labels, icons, and structure provide redundancy)
- Expandable cards provide clear affordance with chevron indicators

**Typography hierarchy:**
- Large greeting text establishes friendly, personal tone
- Section headers ("Your Needles", "Your Thread") clearly delineate content areas
- Consistent sizing for goal titles vs. "Why" subtitles
- Completion counts use smaller, secondary text

**Interaction feedback:**
- Cards should have pressed states
- Dropdowns animate smoothly when expanding/collapsing
- Checkboxes provide haptic feedback on tap (iOS)

## Technical Notes

**API dependencies:**
- **User profile:** For personalized greeting and user name
- **Current date/time:** For calendar, greeting, countdown timer
- **Streak data:** Consecutive daily check-ins from `journal_entries` table
- **Active goals (Needles):** From `goals` table where `status='active'` and `user_id=current_user`
- **Binds (Subtasks):** From `subtask_instances` joined with `subtasks` for each active goal
- **Completion counts:** From `daily_aggregates` or computed from `subtask_completions` for current `local_date`
- **Daily Check-In status:** From `journal_entries` for current `local_date`
- **AI insight:** Generated daily, cached in `ai_insights` table or similar

**Data requirements:**
- Real-time completion counts from `daily_aggregates` table
- Streak calculation: `SELECT COUNT(*) FROM journal_entries WHERE user_id=X AND consecutive=true`
- Active goals with associated subtasks (Binds)
- Journal entry existence for current date
- User's archetype and dream self for AI insight generation
- Calendar week data for date selection

**Performance considerations:**
- **Cache AI insight** for the day to avoid repeated GPT-4o-mini calls (major cost saver)
- **Preload goal and Bind data** to avoid loading states on expansion
- **Optimize calendar rendering** (only 7 days visible)
- **Debounce checkbox interactions** when marking Binds complete to batch updates
- **Consider pull-to-refresh** for latest data without full reload
- **Lazy load expanded Bind lists** if goals have many Binds

**State management:**
- **TanStack Query:** Goals, Binds, completions, daily check-in status, streak data
- **Local state (useState):** Calendar date selection, expanded/collapsed goal states
- **Zustand (optional):** Navigation state, modal state for AI assistant

**Expandable card implementation:**
- Use React Native `LayoutAnimation` or `react-native-reanimated` for smooth height transitions
- Maintain scroll position when expanding/collapsing
- Only one goal expanded at a time (accordion pattern) or allow multiple (optional UX decision)

**Real-time updates:**
- Use optimistic updates when marking Binds complete
- Refetch completion counts after successful mutation
- Update streak counter immediately after daily check-in completion

## Related Wireframes

- **Goal Detail screen** (potentially deeper view beyond expanded inline Bind list)
- **Bind Detail or Completion flow** (marking Bind complete with proof/capture)
- **Daily Check-In flow** (from "Begin" button) - likely multi-step form
- **Moment Capture flow** (from Document card) - photo/note/audio recording
- **Track home page** (from Track tab) - analytics and progress visualization
- **Weave AI assistant modal/overlay** (from center button) - Dream Self chat interface
- **Profile/Settings screen** (from profile icon)
- **Streak history/details** (from streak counter)
- **Historical day view** (from calendar date selection)
