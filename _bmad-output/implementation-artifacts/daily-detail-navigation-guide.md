# Daily Detail Navigation Integration Guide

**Created:** 2025-12-30
**Related:** tech-spec-daily-detail-page.md (Tasks 11-12)

## Overview

This guide shows how to integrate Daily Detail page navigation into Dashboard components once they're implemented.

## Navigation Pattern

**Route:** `/dashboard/daily/[date]`
**Method:** `router.push()` (push navigation, not modal)

## Integration Points

### 1. Calendar Grid Component

**When implemented, add to calendar cell onPress:**

```typescript
// In calendar grid component
const handleDatePress = (date: string) => {
  // Only allow navigation to past/present dates
  const today = new Date().toISOString().split('T')[0];
  if (date <= today) {
    router.push(`/(tabs)/dashboard/daily/${date}`);
  }
};

<Pressable onPress={() => handleDatePress('2025-12-30')}>
  <CalendarCell date="2025-12-30" />
</Pressable>
```

### 2. Fulfillment Graph Component

**When implemented, add to graph point onPress:**

```typescript
// In fulfillment graph component
const handlePointPress = (dataPoint: { date: string; score: number }) => {
  router.push(`/(tabs)/dashboard/daily/${dataPoint.date}`);
};

<PressableGraphPoint onPress={() => handlePointPress(point)} />
```

### 3. History List Component

**When implemented, add to list item onPress:**

```typescript
// In history list component
const handleHistoryItemPress = (entry: { date: string }) => {
  router.push(`/(tabs)/dashboard/daily/${entry.date}`);
};

<Pressable onPress={() => handleHistoryItemPress(item)}>
  <HistoryListItem date={item.date} />
</Pressable>
```

## Back Button Behavior

The Daily Detail page uses `router.back()` which automatically returns to the previous screen at the same scroll position (Expo Router default behavior).

**No special scroll preservation needed** - Expo Router handles this automatically.

## Deep Linking Support

The route structure supports deep linking out of the box:

```
weave://dashboard/daily/2025-12-25
```

Configure in `app.json` if not already set:

```json
{
  "expo": {
    "scheme": "weave",
    "ios": {
      "bundleIdentifier": "com.weave.app"
    }
  }
}
```

## Testing Navigation

### Manual Test Flow:
1. Start from Dashboard page
2. Tap calendar cell for Dec 25
3. Verify: Navigate to Daily Detail (Dec 25)
4. Verify: Back button returns to Dashboard at same position
5. Repeat for fulfillment graph and history list

### Edge Cases to Test:
- ✅ Tapping future date → Shows "hasn't happened yet" error
- ✅ Tapping date with no data → Shows empty states
- ✅ Rapid tapping → Debounce if needed
- ✅ Deep link → Opens correct date

## Notes

**Dashboard pages status:** Not yet implemented
**Action required:** Integrate navigation handlers when dashboard components are built
**Priority:** Medium (dashboard pages are placeholders currently)
