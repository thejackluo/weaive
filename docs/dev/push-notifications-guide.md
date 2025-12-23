# Push Notifications Setup & Usage Guide (Story 6.1)

**Status:** ✅ Fully Implemented
**Last Updated:** December 22, 2025

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Backend Usage](#backend-usage)
5. [Frontend Usage](#frontend-usage)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Production Checklist](#production-checklist)

---

## Overview

Weave uses **Expo Push Notifications** to send server-initiated check-ins to users. This allows the AI coach to proactively reach out to users at optimal times throughout the day.

**Key Features:**
- 📬 Server-initiated check-in notifications
- 🔔 Tap notification → Opens ai-chat screen
- 🔴 Unread badge on AI button
- 📱 Cross-platform (iOS APNs + Android FCM)
- 🛡️ Graceful fallback on simulators

**Tech Stack:**
- **Backend:** FastAPI + httpx + Expo Push API
- **Frontend:** expo-notifications + TanStack Query
- **Database:** `user_profiles.expo_push_token` column

---

## Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Opens App                                           │
│    └─> Registers for push notifications                     │
│    └─> Gets Expo push token                                 │
│    └─> Saves token to backend                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Check-In Scheduler (Backend - Every 5 minutes)           │
│    └─> Calculates check-in time for each user              │
│    └─> If time matches → Creates conversation               │
│    └─> Sends push notification via Expo Push API            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User Receives Notification                               │
│    └─> Notification shows: "Weave Check-In 👋"             │
│    └─> Tap opens ai-chat screen                            │
│    └─> Red badge appears on AI button                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User Opens Chat                                          │
│    └─> Badge disappears                                     │
│    └─> Conversation loaded                                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

**Backend:**
```python
CheckInSchedulerService
├── calculate_checkin_time()      # Hybrid timing (deterministic + variation)
├── should_send_checkin()         # Check if current time matches
├── send_checkin()                # Create conversation + send push
└── send_push_notification()      # ✨ NEW - Expo Push API integration
```

**Frontend:**
```typescript
notificationService.ts
├── registerForPushNotificationsAsync()  # Get Expo token
├── savePushTokenToBackend()            # Save token to API
├── handleNotificationTap()             # Navigate to ai-chat
└── setupNotificationListeners()        # Foreground/background handlers

_layout.tsx (Root)
└── ApiInitializer
    └── Initialize notifications on app startup

(tabs)/_layout.tsx
├── CenterAIButton (hasUnread badge)
└── useQuery polling for unread conversations
```

---

## Setup Instructions

### Prerequisites

1. **Expo Account:** Required for push notifications
2. **Physical Device:** Push notifications don't work on simulators
3. **Expo Project ID:** Already configured in `app.json` (`958e77af-47be-49ec-a7e6-bbfa14552734`)

### Backend Setup

#### 1. Install Dependencies

```bash
cd weave-api
uv add httpx  # For async HTTP requests to Expo Push API
```

#### 2. Apply Database Migration

```bash
cd weavelight
npx supabase db push
```

**Migration:** `20251222000003_add_push_notifications.sql`
**What it does:** Adds `expo_push_token` column to `user_profiles` table

#### 3. Verify Migration

```sql
-- Check column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'expo_push_token';

-- Expected output:
-- column_name      | data_type
-- expo_push_token  | text
```

#### 4. Start Backend Server

```bash
cd weave-api
uv run uvicorn app.main:app --reload
```

### Frontend Setup

#### 1. Install Dependencies

```bash
cd weave-mobile
npx expo install expo-notifications
```

#### 2. Configure Expo Project

**Already configured in `app.json`:**
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "958e77af-47be-49ec-a7e6-bbfa14552734"
      }
    }
  }
}
```

#### 3. Test on Physical Device

```bash
cd weave-mobile
npm start

# Then scan QR code with Expo Go app
```

**On first launch:**
1. App will request notification permissions
2. Grant permissions
3. Check logs for: `[ROOT_LAYOUT] ✅ Push notifications registered and saved`

---

## Backend Usage

### Sending Push Notifications

#### Automatic (Check-In Scheduler)

Check-in scheduler automatically sends push notifications when triggering check-ins.

**File:** `weave-api/app/services/checkin_scheduler.py`

```python
# Already implemented - runs every 5 minutes
async def send_checkin(self, user_id: UUID, display_name: str):
    # ... creates conversation ...

    # Send push notification
    await self.send_push_notification(user_id, message, str(conversation_id))
```

#### Manual (Admin Endpoint)

Trigger a check-in manually for testing:

```bash
curl -X POST http://localhost:8000/api/admin/trigger-checkin/USER_ID \
  -H "X-Admin-Key: dev-unlimited-access-key-2025"
```

### Push Notification Method

```python
async def send_push_notification(self, user_id: UUID, message: str, conversation_id: str):
    """
    Send push notification via Expo Push API.

    Args:
        user_id: User UUID
        message: Notification body text
        conversation_id: Conversation to open when tapped
    """
    import httpx

    # Get user's push token from database
    push_token = db.table('user_profiles').select('expo_push_token').eq('id', user_id).single()

    # Send via Expo Push API
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://exp.host/--/api/v2/push/send',
            json={
                'to': push_token,
                'title': 'Weave Check-In 👋',
                'body': message,
                'data': {
                    'type': 'checkin',
                    'conversation_id': conversation_id,
                    'screen': 'ai-chat'
                },
                'sound': 'default',
                'priority': 'high'
            }
        )
```

### Saving Push Tokens

**Endpoint:** `POST /api/user/push-token`

**Frontend automatically calls this on app startup.**

```bash
curl -X POST http://localhost:8000/api/user/push-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"}'
```

**Response:**
```json
{
  "message": "Push token saved successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Frontend Usage

### Registration (Automatic)

Push notification registration happens **automatically on app startup** in `app/_layout.tsx`:

```typescript
// In ApiInitializer useEffect
(async () => {
  // Register for push notifications and get token
  const pushToken = await registerForPushNotificationsAsync();

  if (pushToken) {
    // Save token to backend
    await savePushTokenToBackend(pushToken);
    console.log('[ROOT_LAYOUT] ✅ Push notifications registered and saved');
  }
})();

// Setup notification listeners
const cleanupListeners = setupNotificationListeners();
```

### Handling Notification Taps

**File:** `weave-mobile/src/services/notificationService.ts`

```typescript
export function handleNotificationTap(notification: Notifications.Notification): void {
  const data = notification.request.content.data;

  // Handle check-in notifications - open ai-chat screen
  if (data.type === 'checkin' && data.screen === 'ai-chat') {
    router.push('/(tabs)/ai-chat');
    console.log('[NOTIFICATIONS] 🔀 Navigated to ai-chat screen');
  }
}
```

### Unread Badge Indicator

**File:** `weave-mobile/app/(tabs)/_layout.tsx`

```typescript
// Poll for unread check-in conversations
const { data: conversations } = useQuery({
  queryKey: ['ai-chat-conversations'],
  queryFn: async () => {
    const response = await apiClient.get('/api/ai-chat/conversations');
    return response.data.data || [];
  },
  refetchInterval: 30000, // Check every 30 seconds
  enabled: !aiChatVisible, // Don't check when chat is open
});

// Check for system-initiated conversations
const hasSystemInitiated = conversations.some(conv => conv.initiated_by === 'system');

// Pass to AI button
<CenterAIButton onPress={openAIChat} hasUnread={hasSystemInitiated} />
```

**Badge clears when chat is opened:**
```typescript
const openAIChat = () => {
  setAIChatVisible(true);
  setHasUnreadCheckins(false); // Clear badge
};
```

---

## Testing

### Test 1: Register for Notifications (Physical Device Required)

**Prerequisites:**
- Physical iOS or Android device
- Expo Go app installed

**Steps:**
1. Start backend: `cd weave-api && uv run uvicorn app.main:app --reload`
2. Start frontend: `cd weave-mobile && npm start`
3. Scan QR code with Expo Go
4. Grant notification permissions when prompted

**Expected Logs:**
```
[ROOT_LAYOUT] 📱 Not a physical device - push notifications unavailable  // If simulator
[ROOT_LAYOUT] ✅ Push notifications registered and saved                // If physical device
[NOTIFICATIONS] ✅ Expo push token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**Verify in Database:**
```sql
SELECT id, expo_push_token
FROM user_profiles
WHERE auth_user_id = 'YOUR_AUTH_USER_ID';
```

### Test 2: Receive Push Notification

**Prerequisites:**
- Test 1 completed (device registered)
- App running in background or closed

**Steps:**
1. Get your user ID from database:
   ```sql
   SELECT id FROM user_profiles WHERE auth_user_id = 'YOUR_AUTH_USER_ID';
   ```

2. Trigger manual check-in:
   ```bash
   curl -X POST http://localhost:8000/api/admin/trigger-checkin/YOUR_USER_ID \
     -H "X-Admin-Key: dev-unlimited-access-key-2025"
   ```

3. Check backend logs:
   ```
   ✅ Sent check-in to user YOUR_USER_ID
   ✅ Push notification sent to user YOUR_USER_ID
   ```

4. Check device:
   - Notification appears: "Weave Check-In 👋"
   - Body: "Good morning! Ready to tackle your 3 binds today?" (or similar)

5. Tap notification:
   - App opens
   - Navigates to ai-chat screen
   - Conversation loaded

**Expected Result:** ✅ Notification received and tap opens ai-chat screen

### Test 3: Unread Badge

**Steps:**
1. Trigger check-in (as in Test 2)
2. **Don't open the app yet**
3. Launch app manually
4. **Expected:** Red badge dot appears on center AI button
5. Tap AI button
6. **Expected:** Badge disappears

**Troubleshooting Badge:**
- Check logs for: `[NOTIFICATIONS] 📬 Notification received (foreground)`
- Verify conversation exists:
  ```sql
  SELECT id, initiated_by FROM ai_chat_conversations WHERE user_id = 'YOUR_USER_ID';
  ```
- Badge only shows for `initiated_by = 'system'` conversations

### Test 4: Foreground Notifications

**Steps:**
1. Open app
2. Navigate to any screen (not ai-chat)
3. Trigger check-in (as in Test 2)
4. **Expected:** Notification appears as banner while app is open

### Test 5: Background Notifications

**Steps:**
1. Open app
2. Minimize app (home button or swipe up)
3. Trigger check-in (as in Test 2)
4. **Expected:** Notification appears in notification center
5. Tap notification
6. **Expected:** App opens to ai-chat screen

---

## Troubleshooting

### "Push notifications not available (simulator)"

**Problem:** Running on iOS Simulator or Android Emulator

**Solution:** Push notifications only work on physical devices. Use Expo Go on a real device:
1. Install Expo Go from App Store/Play Store
2. Run `npm start` in terminal
3. Scan QR code with Expo Go

### "Notification permissions denied"

**Problem:** User denied notification permissions

**Solution:**
1. **iOS:** Settings → App → Notifications → Allow Notifications
2. **Android:** Settings → Apps → App → Notifications → Enable

### "No push token for user"

**Problem:** Token not saved to database

**Logs:**
```
[NOTIFICATIONS] ⚠️ No push token for user {user_id}, skipping notification
```

**Solution:**
1. Check `expo_push_token` column in database:
   ```sql
   SELECT expo_push_token FROM user_profiles WHERE id = 'USER_ID';
   ```
2. If NULL, restart app to re-register
3. Check for errors in frontend logs: `[ROOT_LAYOUT] ❌ Error initializing push notifications`

### "Invalid push token format"

**Problem:** Token doesn't start with `ExponentPushToken[`

**Solution:** This should never happen with proper setup. If it does:
1. Clear app data
2. Restart app
3. Re-grant notification permissions

### "Push notification sent but not received"

**Possible Causes:**

1. **Device offline:** Check internet connection
2. **Expo Push API error:** Check backend logs for HTTP errors
3. **Token expired:** Tokens can expire after months of inactivity
   - **Solution:** Restart app to refresh token

4. **Wrong Expo project ID:** Verify `app.json` has correct projectId:
   ```json
   "extra": {
     "eas": {
       "projectId": "958e77af-47be-49ec-a7e6-bbfa14552734"
     }
   }
   ```

5. **iOS: App in Low Power Mode:** Notifications may be delayed
6. **Android: Battery optimization:** Disable battery optimization for Expo Go

### Badge doesn't appear after check-in

**Problem:** Unread badge not showing on AI button

**Solution:**
1. Check conversation created:
   ```sql
   SELECT id, initiated_by FROM ai_chat_conversations
   WHERE user_id = 'USER_ID'
   ORDER BY started_at DESC LIMIT 1;
   ```
2. Verify `initiated_by = 'system'` (not 'user')
3. Check frontend polling logs:
   ```
   [NOTIFICATIONS] 📬 Checking for unread conversations
   ```
4. Badge polling is 30 seconds - wait up to 30s after check-in

---

## Production Checklist

### Before Production Launch

- [ ] **Remove admin mode** from `app/_layout.tsx` (line 53)
- [ ] **Implement proper read tracking** for conversations
  - Currently shows badge for ANY system-initiated conversation
  - Need to track `last_read_at` timestamp per conversation

- [ ] **Add token refresh logic**
  - Tokens can expire after months
  - Implement periodic refresh (e.g., every 30 days)

- [ ] **Monitor Expo Push API quota**
  - Free tier: 1M notifications/month
  - Paid tier: Unlimited
  - Set up alerts for quota usage

- [ ] **Handle push notification failures gracefully**
  - Log failed notifications to database for retry
  - Add retry queue for transient failures

- [ ] **Test on both platforms**
  - [ ] iOS physical device (APNs)
  - [ ] Android physical device (FCM)

- [ ] **Configure iOS APNs certificates** (if using bare workflow)
  - Managed workflow (Expo Go) handles this automatically

- [ ] **Configure Android FCM credentials** (if using bare workflow)
  - Managed workflow (Expo Go) handles this automatically

### Production Configuration

**Backend `.env`:**
```bash
# Already configured
ADMIN_API_KEY=<generate-secure-key-for-production>
```

**Frontend `app.json`:**
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "958e77af-47be-49ec-a7e6-bbfa14552734"  // Already correct
      }
    },
    "notification": {
      "icon": "./assets/notification-icon.png",  // TODO: Add notification icon
      "color": "#3B72F6",
      "androidMode": "default"
    }
  }
}
```

### Monitoring & Alerts

**Metrics to track:**
- Notification delivery rate (successful / attempted)
- Average notification tap rate
- Token refresh rate
- Failed notification reasons

**Recommended tools:**
- Expo Push Notification API dashboard
- Backend logging (already implemented)
- Sentry for error tracking

---

## API Reference

### Backend Endpoints

#### `POST /api/user/push-token`

Save Expo push token for authenticated user.

**Request:**
```json
{
  "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response (200 OK):**
```json
{
  "message": "Push token saved successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Errors:**
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: User profile not found
- `422 Unprocessable Entity`: Invalid push token format

#### `POST /api/admin/trigger-checkin/{user_id}`

Manually trigger check-in for testing (admin only).

**Headers:**
```
X-Admin-Key: dev-unlimited-access-key-2025
```

**Response (200 OK):**
```json
{
  "data": {
    "success": true,
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Good morning! Ready to tackle your 3 binds today?"
  }
}
```

### Frontend API

#### `registerForPushNotificationsAsync(): Promise<string | null>`

Registers device for push notifications and returns Expo push token.

**Returns:**
- `string`: Expo push token (format: `ExponentPushToken[...]`)
- `null`: If registration failed (permissions denied, simulator, etc.)

**Example:**
```typescript
const pushToken = await registerForPushNotificationsAsync();
if (pushToken) {
  console.log('Registered:', pushToken);
}
```

#### `savePushTokenToBackend(pushToken: string): Promise<void>`

Saves push token to backend API.

**Throws:** Error if API request fails

**Example:**
```typescript
await savePushTokenToBackend(pushToken);
```

#### `handleNotificationTap(notification: Notifications.Notification): void`

Handles notification tap - navigates to appropriate screen.

**Called automatically by notification listeners.**

#### `setupNotificationListeners(): () => void`

Sets up foreground/background notification listeners.

**Returns:** Cleanup function

**Example:**
```typescript
useEffect(() => {
  const cleanup = setupNotificationListeners();
  return cleanup; // Cleanup on unmount
}, []);
```

---

## Database Schema

### `user_profiles.expo_push_token`

**Column:** `expo_push_token TEXT`
**Purpose:** Stores Expo push token for sending notifications
**Format:** `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`
**Nullable:** Yes (NULL if user hasn't granted permissions)

**Migration:** `20251222000003_add_push_notifications.sql`

```sql
-- View tokens
SELECT id, display_name, expo_push_token
FROM user_profiles
WHERE expo_push_token IS NOT NULL;

-- Count registered devices
SELECT COUNT(*) as registered_devices
FROM user_profiles
WHERE expo_push_token IS NOT NULL;
```

---

## Related Documentation

- **Story 6.1 Spec:** `docs/stories/6-1-ai-chat-interface.md`
- **Check-In Scheduler:** `weave-api/app/services/checkin_scheduler.py`
- **Notification Service:** `weave-mobile/src/services/notificationService.ts`
- **Backend API:** `weave-api/app/api/user.py` (push token endpoint)
- **Expo Notifications Docs:** https://docs.expo.dev/push-notifications/overview/

---

## FAQ

### Q: Do push notifications work on simulators?

**A:** No, push notifications require physical devices. The app gracefully handles this - you'll see a log message: `📱 Not a physical device - push notifications unavailable`

### Q: How do I test push notifications in development?

**A:** Use the admin endpoint to trigger manual check-ins:
```bash
curl -X POST http://localhost:8000/api/admin/trigger-checkin/USER_ID \
  -H "X-Admin-Key: dev-unlimited-access-key-2025"
```

### Q: What happens if a user denies notification permissions?

**A:** The app continues to work normally. Users can still see check-ins in the ai-chat screen, they just won't receive push notifications. The unread badge will still appear.

### Q: Can I customize the notification sound?

**A:** Yes, modify the `sound` field in `send_push_notification()`:
```python
'sound': 'default'  # or 'custom_sound.wav'
```

### Q: How many notifications can I send per day?

**A:** Expo free tier: 1M notifications/month. For Weave, with 10K users and 1 check-in/day = 300K/month (well within limits).

### Q: What if a push token expires?

**A:** Tokens can expire after months of inactivity. The app will automatically refresh the token on next launch. In production, implement a periodic refresh (e.g., every 30 days).

---

**Last Updated:** December 22, 2025
**Maintained By:** Weave Development Team
**Questions?** Open an issue on GitHub
