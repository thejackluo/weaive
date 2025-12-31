# Tech-Spec: Daily Detail Page

**Created:** 2025-12-30
**Status:** Ready for Development
**Epic:** Dashboard Page (Epic 2 + 5)
**Related Stories:** Story 5.1 (Calendar Grid), Story 5.2 (Fulfillment Graph), Story 2.5 (History)

## Overview

### Problem Statement

Users need to view complete daily data (binds with proof, journal reflections) from multiple dashboard entry points (calendar grid, fulfillment graph, history list). Currently, clicking these elements has no action or uses placeholder screens. Users cannot see the full details of their completed binds (images, notes, timer duration) or reflection answers.

### Solution

Create a unified **Daily Detail page** (`app/(tabs)/dashboard/daily/[date].tsx`) that:
- Displays all daily data (binds + proof + journal) for any past date
- Accessible from 3 entry points: calendar grid, fulfillment graph, history list
- Uses expandable cards (Binds section, Reflection section) with independent toggles
- Shows bind completion proof (image galleries, timer badges, notes)
- Integrates fulfillment score into Reflection card (not separate section)
- Prevents access to future dates

### Scope (In/Out)

**In Scope:**
- ✅ New route: `app/(tabs)/dashboard/daily/[date].tsx`
- ✅ New backend endpoint: `GET /api/daily-summary/{date}`
- ✅ Expandable card wrapper component (independent toggles)
- ✅ Fullscreen image lightbox/modal
- ✅ Audio playback widget for voice notes
- ✅ Timer duration badge component
- ✅ Empty states for missing data (no binds, no journal, no proof)
- ✅ Navigation from calendar, graph, history
- ✅ Prevent future date access

**Out of Scope:**
- ❌ Editing bind completions (view-only)
- ❌ Editing journal entries (view-only for now)
- ❌ Deleting completions or captures
- ❌ AI-generated insights/recap (future epic)
- ❌ Sharing/exporting daily summaries

## Context for Development

### Codebase Patterns

**Backend (FastAPI):**
- Standard patterns per Story 1.5.2 (Backend Standardization)
- Router: `weave-api/app/api/daily_summary_router.py` (NEW)
- Use JWT auth: `user: dict = Depends(get_current_user)`
- Response format: `{data: {...}, meta: {timestamp: "..."}}`
- Error codes: `DAILY_SUMMARY_NOT_FOUND` (404), `INVALID_DATE_FORMAT` (400)

**Frontend (React Native + Expo Router):**
- File-based routing: `app/(tabs)/dashboard/daily/[date].tsx`
- Design system: Import from `@/design-system` (Card, Heading, Body, Button)
- State management: TanStack Query for server data (NOT Zustand)
- Navigation: Push (not modal) - allows back button
- Styling: NativeWind (Tailwind CSS)

**Existing Components to Reuse:**
- `ImageGallery` (`src/components/ImageGallery.tsx`) - Grid view with filters
- `Card` (`@/design-system`) - Glass-effect cards
- Timer pattern: `duration_minutes` in `completion_details`

**NEW Components to Create:**
- `ExpandableCard` - Wrapper for collapsible content (independent toggles)
- `ImageLightbox` - Fullscreen image viewer with swipe
- `AudioPlayer` - Playback widget for voice notes
- `TimerBadge` - Display timer duration (e.g., "25 min")

### Files to Reference

**Backend:**
- `weave-api/app/api/journal_router.py` - Journal entry structure
- `weave-api/app/api/binds/router.py` - Bind completion details
- `weave-api/app/api/captures.py` - Image capture structure
- `weave-api/app/core/deps.py` - JWT auth dependencies

**Frontend:**
- `weave-mobile/src/screens/ThreadHomeScreen.tsx` - Card + bind rendering patterns
- `weave-mobile/src/components/ImageGallery.tsx` - Image grid pattern
- `weave-mobile/src/types/binds.ts` - Bind type definitions
- `weave-mobile/app/(tabs)/journal/history.tsx` - History screen (entry point)
- `weave-mobile/src/design-system/components/Card/Card.tsx` - Card variants

**Database Tables:**
- `subtask_completions` - Bind completion events (completed_at, duration_minutes, notes)
- `captures` - Proof images/audio (completion_id, capture_type, storage_path)
- `journal_entries` - Daily reflections (fulfillment_score, default_responses)
- `daily_aggregates` - Metadata (completed_count, has_proof, has_journal)

### Technical Decisions

**Decision 1: Single Consolidated API Endpoint**
- **Choice:** Create `GET /api/daily-summary/{date}` instead of multiple API calls
- **Rationale:** Reduces network overhead, atomic data consistency, simpler frontend logic
- **Trade-off:** Backend complexity increases (joins across 4 tables)

**Decision 2: Independent Card Toggles (Not Accordion)**
- **Choice:** Both Binds + Reflection cards can be expanded simultaneously
- **Rationale:** Users may want to compare binds with reflection answers
- **Trade-off:** Longer scroll height when both expanded

**Decision 3: Push Navigation (Not Modal)**
- **Choice:** Daily Detail is a full screen with back button
- **Rationale:** Better for deep linking, more space for media, easier state management
- **Trade-off:** Cannot see dashboard context while viewing detail

**Decision 4: Fulfillment Score in Reflection Card**
- **Choice:** Move fulfillment score from separate section to Reflection card header
- **Rationale:** Reduces visual clutter, score is part of reflection data
- **Trade-off:** None (user-requested change)

**Decision 5: Block Future Dates**
- **Choice:** Return 400 error for dates > today, show error state in UI
- **Rationale:** No data exists for future dates, prevents confusion
- **Trade-off:** Cannot pre-plan journal entries (acceptable for MVP)

## Implementation Plan

### Tasks

#### Backend Tasks

- [ ] **Task 1: Create Daily Summary Router**
  - Create `weave-api/app/api/daily_summary_router.py`
  - Add JWT auth: `Depends(get_current_user)`
  - Register router in `weave-api/app/main.py`

- [ ] **Task 2: Implement GET /api/daily-summary/{date} Endpoint**
  - Path param: `date` (YYYY-MM-DD format)
  - Validate date format (400 if invalid)
  - Block future dates (400 if date > today)
  - Query:
    1. `daily_aggregates` (completed_count, has_proof, has_journal)
    2. `subtask_completions` + JOIN `subtask_instances` + `subtask_templates` + `goals`
    3. `captures` WHERE completion_id IN (...)
    4. `journal_entries` WHERE local_date = {date}
  - Return consolidated response (see structure below)

- [ ] **Task 3: Add Tests for Daily Summary Endpoint**
  - Test: Valid date returns 200 with full data
  - Test: Date with no data returns 200 with empty arrays
  - Test: Future date returns 400
  - Test: Invalid date format returns 400
  - Test: Unauthorized request returns 401

#### Frontend Tasks

- [ ] **Task 4: Create ExpandableCard Component**
  - File: `weave-mobile/src/components/ExpandableCard.tsx`
  - Props: `title`, `subtitle`, `defaultExpanded`, `children`
  - State: `isExpanded` (independent toggle, not accordion)
  - Animated collapse/expand with spring animation
  - Chevron icon rotates on toggle

- [ ] **Task 5: Create ImageLightbox Component**
  - File: `weave-mobile/src/components/ImageLightbox.tsx`
  - Props: `images`, `initialIndex`, `visible`, `onClose`
  - Swipe left/right to navigate images
  - Pinch-to-zoom support
  - Close button (X) in top-right
  - Image counter (1/5) in bottom

- [ ] **Task 6: Create AudioPlayer Component**
  - File: `weave-mobile/src/components/AudioPlayer.tsx`
  - Props: `audioUrl`, `duration`
  - Uses `expo-av` for playback
  - UI: Play/pause button + waveform visual + timestamp
  - Auto-downloads audio from Supabase storage URL

- [ ] **Task 7: Create TimerBadge Component**
  - File: `weave-mobile/src/components/TimerBadge.tsx`
  - Props: `durationMinutes`
  - Display: Clock icon + "25 min" text
  - Styling: Glass badge with accent color

- [ ] **Task 8: Create Daily Detail Page**
  - File: `app/(tabs)/dashboard/daily/[date].tsx`
  - Use `useLocalSearchParams()` to get date param
  - TanStack Query: `useDailyDetail(date)` hook
  - Loading state: Skeleton cards
  - Error state: "Could not load daily data" with retry
  - Empty state: Per AC #11 (see below)

- [ ] **Task 9: Implement Binds Section**
  - Use `ExpandableCard` wrapper
  - Title: "Daily Binds" + completion count (e.g., "2/3 completed")
  - Default: Expanded
  - For each bind:
    - Header: Bind name + goal name + completion time
    - Proof: Image thumbnails (horizontal scroll) + tap for lightbox
    - Notes: Display if present
    - Timer badge: Display if duration_minutes present
  - Empty state: "No binds active on this day"

- [ ] **Task 10: Implement Reflection Section**
  - Use `ExpandableCard` wrapper
  - Title: "Daily Reflection" + fulfillment score (e.g., "7/10 ⭐")
  - Default: Collapsed
  - Content:
    - Fulfillment score (large number + stars)
    - Default questions + answers
    - Custom questions + answers (if present)
    - Timestamp: "Reflected at 9:45 PM"
  - Empty state: "No reflection recorded for this day"

- [ ] **Task 11: Add Navigation from Dashboard**
  - Calendar grid: `onPress={() => router.push('/dashboard/daily/2025-12-30')}`
  - Fulfillment graph: Pass date from tapped point
  - History list: Pass date from selected item

- [ ] **Task 12: Prevent Future Date Access**
  - Check: `if (date > today) show error`
  - Error UI: "This day hasn't happened yet" with back button

#### Testing Tasks

- [ ] **Task 13: Test API Integration**
  - Verify `useDailyDetail` hook fetches correct data
  - Test loading/error/empty states
  - Test date param routing

- [ ] **Task 14: Test UI Components**
  - ExpandableCard: Toggle behavior, animations
  - ImageLightbox: Swipe navigation, zoom, close
  - AudioPlayer: Play/pause, scrubbing
  - TimerBadge: Display formatting

- [ ] **Task 15: Test Navigation**
  - Verify back button returns to dashboard at same scroll
  - Test deep linking: `/dashboard/daily/2025-12-25`

### Acceptance Criteria

**AC #1: API Endpoint Returns Consolidated Data**
- **Given:** User has binds + journal for 2025-12-30
- **When:** GET /api/daily-summary/2025-12-30
- **Then:** Returns 200 with structure:
```json
{
  "data": {
    "date": "2025-12-30",
    "aggregates": {
      "completed_count": 2,
      "total_binds": 3,
      "has_proof": true,
      "has_journal": true
    },
    "binds": [{
      "id": "bind_123",
      "title": "Meditation",
      "goal_name": "Morning Routine",
      "goal_color": "blue",
      "completed": true,
      "completed_at": "2025-12-30T08:30:00Z",
      "duration_minutes": 25,
      "notes": "Felt centered today",
      "captures": [{
        "id": "cap_456",
        "capture_type": "image",
        "storage_path": "...",
        "signed_url": "https://...",
        "created_at": "2025-12-30T08:32:00Z"
      }]
    }],
    "journal_entry": {
      "id": "journal_789",
      "fulfillment_score": 7,
      "default_responses": {
        "today_reflection": "Productive morning...",
        "tomorrow_focus": "Continue momentum"
      },
      "custom_responses": null,
      "submitted_at": "2025-12-30T21:45:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-12-30T22:00:00Z"
  }
}
```

**AC #2: Empty State Handling**
- **Given:** User has no binds or journal for 2025-12-20
- **When:** Navigate to /dashboard/daily/2025-12-20
- **Then:** Show empty state messages:
  - "No binds active on this day" (Binds section)
  - "No reflection recorded for this day" (Reflection section)

**AC #3: Future Date Blocked**
- **Given:** Today is 2025-12-30
- **When:** Navigate to /dashboard/daily/2025-12-31
- **Then:** Show error: "This day hasn't happened yet" + back button

**AC #4: Expandable Cards Work Independently**
- **Given:** Daily Detail page loaded
- **When:** User taps Binds section header
- **Then:** Binds section expands/collapses with animation
- **And:** Reflection section state unchanged (independent toggle)

**AC #5: Image Gallery Opens Fullscreen**
- **Given:** Bind has 3 proof images
- **When:** User taps second thumbnail
- **Then:** Lightbox opens at image 2/3
- **And:** User can swipe left/right to navigate
- **And:** User can pinch-to-zoom
- **And:** User can tap X to close

**AC #6: Audio Player Works**
- **Given:** Bind has voice note capture
- **When:** User taps play button
- **Then:** Audio plays from Supabase storage URL
- **And:** Waveform animates
- **And:** Timestamp updates

**AC #7: Timer Badge Displays Duration**
- **Given:** Bind completed with duration_minutes = 25
- **When:** Viewing bind details
- **Then:** Show badge: "🕐 25 min"

**AC #8: Fulfillment Score in Reflection Card**
- **Given:** Journal entry has fulfillment_score = 7
- **When:** Viewing Reflection section
- **Then:** Card header shows: "Daily Reflection • 7/10 ⭐"

**AC #9: Navigation from Calendar Grid**
- **Given:** User on Dashboard page
- **When:** User taps calendar cell for Dec 25
- **Then:** Navigate to /dashboard/daily/2025-12-25 (push)
- **And:** Back button returns to Dashboard at same scroll position

**AC #10: Navigation from Fulfillment Graph**
- **Given:** User on Dashboard page
- **When:** User taps fulfillment graph point (Dec 28)
- **Then:** Navigate to /dashboard/daily/2025-12-28 (push)

**AC #11: Navigation from History List**
- **Given:** User on Dashboard page
- **When:** User taps history list entry (Dec 20)
- **Then:** Navigate to /dashboard/daily/2025-12-20 (push)

**AC #12: Multiple Images Displayed**
- **Given:** Bind has 5 proof images
- **When:** Viewing bind details
- **Then:** Show horizontal scrollable thumbnails (3 visible at once)
- **And:** Tap any thumbnail opens lightbox at that image

**AC #13: Notes Displayed Correctly**
- **Given:** Bind completed with notes = "Felt centered today"
- **When:** Viewing bind details
- **Then:** Show notes in gray text below media

**AC #14: Custom Journal Questions Displayed**
- **Given:** Journal has custom_responses = {"q1": {"question_text": "Sleep quality?", "response": "8/10"}}
- **When:** Viewing Reflection section
- **Then:** Show custom questions below default responses:
  - "Sleep quality?: 8/10"

**AC #15: Deep Linking Works**
- **Given:** User shares link: `weave://dashboard/daily/2025-12-15`
- **When:** User taps link
- **Then:** App opens to Daily Detail page for Dec 15

## Additional Context

### Dependencies

**Backend:**
- FastAPI (existing)
- Supabase Python client (existing)
- JWT auth middleware (Story 0.3)

**Frontend:**
- Expo Router (existing)
- TanStack Query (existing)
- expo-av (NEW - for audio playback)
- react-native-reanimated (existing - for animations)
- react-native-gesture-handler (existing - for swipe)

**Install:**
```bash
cd weave-mobile
npx expo install expo-av
```

### Testing Strategy

**Backend Tests (pytest):**
- File: `weave-api/tests/test_daily_summary_api.py`
- Coverage: All 5 endpoint test cases (AC #1-3)
- Fixtures: Mock user, binds, journal, captures

**Frontend Tests (Jest + React Native Testing Library):**
- File: `weave-mobile/src/screens/__tests__/DailyDetailScreen.test.tsx`
- Coverage: Component rendering, navigation, empty states
- Mock: `useDailyDetail` hook with test data

**Integration Tests:**
- Manual test: E2E flow from Dashboard → Daily Detail → Back
- Verify: Image lightbox, audio playback, expandable cards

### Notes

**Performance Considerations:**
- Image thumbnails: Lazy load offscreen images
- Audio: Only load when user taps play
- Query caching: 5 min staleTime for daily summaries (data doesn't change)

**Accessibility:**
- All interactive elements have accessible labels
- Screen reader support for expand/collapse
- High contrast for text on glass cards

**Future Enhancements (Out of Scope):**
- Edit mode for journal entries
- Delete/hide completed binds
- Export daily summary as PDF
- AI-generated recap card (Epic 6)

---

**Implementation Order:**
1. Backend: API endpoint first (Tasks 1-3)
2. Frontend: Components (Tasks 4-7)
3. Frontend: Page (Tasks 8-10)
4. Integration: Navigation (Tasks 11-12)
5. Testing: Verify all ACs (Tasks 13-15)

**Estimated Complexity:** Medium (3-4 hours implementation + 1-2 hours testing)
