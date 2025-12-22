"""
Check-In Scheduler Service (Story 6.1)

Server-initiated conversations with hybrid timing system.

Timing System:
- Base time: Random hour (9 AM - 9 PM) seeded by user_id + date (consistent each day)
- Hybrid mode (default): Add ±10-15 min variation to base time
- Deterministic mode: Exact same time every day (no variation)

Schedule:
- Cron job runs every 5 minutes
- Checks if current time matches user's calculated check-in time (±2 min window)
- Sends push notification + creates system-initiated conversation

Timezone-aware:
- Respects user's timezone setting (checkin_timezone)
- Calculates check-in time in user's local time
"""

import logging
import random
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class CheckInSchedulerService:
    """
    Manages server-initiated check-ins with hybrid timing.

    Features:
    - Timezone-aware scheduling
    - Hybrid timing (base time + optional variation)
    - Deterministic mode option
    - Contextual messages based on time of day
    """

    def __init__(self, db: SupabaseClient):
        """
        Initialize check-in scheduler.

        Args:
            db: Supabase client
        """
        self.db = db
        self.scheduler = AsyncIOScheduler()

    def start(self):
        """
        Start the check-in scheduler.

        Runs every 5 minutes to check for users needing check-ins.
        """
        self.scheduler.add_job(
            self.check_and_send_checkins,
            'cron',
            minute='*/5',  # Every 5 minutes
            id='checkin_scheduler',
            replace_existing=True
        )
        self.scheduler.start()
        logger.info("✅ Check-in scheduler started (runs every 5 minutes)")

    def stop(self):
        """Stop the check-in scheduler."""
        self.scheduler.shutdown()
        logger.info("⏹️  Check-in scheduler stopped")

    async def check_and_send_checkins(self):
        """
        Check all users and send check-ins to those whose time has come.

        Called every 5 minutes by APScheduler.
        """
        try:
            logger.debug("🔍 Checking for users needing check-ins...")

            # Get all users with check-ins enabled
            result = self.db.table('user_profiles') \
                .select('id, checkin_enabled, checkin_timezone, checkin_deterministic, last_checkin_at, display_name') \
                .eq('checkin_enabled', True) \
                .execute()

            users = result.data
            logger.debug(f"Found {len(users)} users with check-ins enabled")

            checkin_count = 0
            for user in users:
                user_id = UUID(user['id'])
                user_tz_name = user.get('checkin_timezone', 'America/Los_Angeles')
                deterministic = user.get('checkin_deterministic', False)
                last_checkin = user.get('last_checkin_at')

                # Calculate check-in time for this user
                try:
                    checkin_time = self.calculate_checkin_time(
                        user_id=user_id,
                        timezone_name=user_tz_name,
                        deterministic=deterministic
                    )

                    # Check if current time matches check-in time (±2 min window)
                    if self.should_send_checkin(checkin_time, user_tz_name, last_checkin):
                        await self.send_checkin(user_id, user.get('display_name', 'there'))
                        checkin_count += 1

                except Exception as e:
                    logger.error(f"Error processing check-in for user {user_id}: {e}")
                    continue

            if checkin_count > 0:
                logger.info(f"✅ Sent {checkin_count} check-ins")

        except Exception as e:
            logger.error(f"Error in check-in scheduler: {e}")

    def calculate_checkin_time(
        self,
        user_id: UUID,
        timezone_name: str = 'America/Los_Angeles',
        deterministic: bool = False
    ) -> datetime:
        """
        Calculate check-in time for user with optional variation.

        Args:
            user_id: User UUID
            timezone_name: IANA timezone (e.g., 'America/Los_Angeles')
            deterministic: If True, exact same time daily (no variation)

        Returns:
            Check-in datetime in user's timezone
        """
        try:
            user_tz = pytz.timezone(timezone_name)
        except:
            logger.warning(f"Invalid timezone {timezone_name}, using UTC")
            user_tz = pytz.UTC

        user_now = datetime.now(user_tz)

        # Generate base check-in time (9 AM - 9 PM) seeded by user_id + date
        # This ensures same base time each day for consistency
        seed = f"{str(user_id)}_{user_now.date()}"
        random.seed(seed)
        base_hour = random.randint(9, 21)  # 9 AM to 9 PM
        base_minute = random.randint(0, 59)

        base_time = user_now.replace(hour=base_hour, minute=base_minute, second=0, microsecond=0)

        # If deterministic mode, return exact base time
        if deterministic:
            logger.debug(f"User {user_id} deterministic mode: {base_time}")
            return base_time

        # Add 10-15 minute variation for hybrid mode
        # Seeded by user_id + date + hour for consistency within day
        variation_seed = f"{str(user_id)}_{user_now.date()}_{base_hour}"
        random.seed(variation_seed)
        variation_minutes = random.randint(10, 15) * random.choice([-1, 1])  # ±10-15 min

        actual_time = base_time + timedelta(minutes=variation_minutes)
        logger.debug(f"User {user_id} hybrid mode: base={base_time}, variation={variation_minutes}min, actual={actual_time}")

        return actual_time

    def should_send_checkin(
        self,
        checkin_time: datetime,
        timezone_name: str,
        last_checkin_at: Optional[str]
    ) -> bool:
        """
        Determine if user should receive check-in now.

        Args:
            checkin_time: Calculated check-in time
            timezone_name: User's timezone
            last_checkin_at: ISO timestamp of last check-in (or None)

        Returns:
            True if check-in should be sent now
        """
        try:
            user_tz = pytz.timezone(timezone_name)
        except:
            user_tz = pytz.UTC

        current_time = datetime.now(user_tz)

        # Check if within ±2 minute window
        time_diff = abs((current_time - checkin_time).total_seconds())
        in_window = time_diff <= 120  # 2 minutes = 120 seconds

        if not in_window:
            return False

        # Check if already sent today
        if last_checkin_at:
            try:
                last_checkin = datetime.fromisoformat(last_checkin_at.replace('Z', '+00:00'))
                last_checkin = last_checkin.astimezone(user_tz)

                # If last check-in was today, don't send again
                if last_checkin.date() == current_time.date():
                    logger.debug(f"Already sent check-in today at {last_checkin}")
                    return False
            except:
                pass  # If parsing fails, proceed with check-in

        logger.debug(f"✅ Check-in time matched: current={current_time}, target={checkin_time}, diff={time_diff}s")
        return True

    async def send_checkin(self, user_id: UUID, display_name: str = "there"):
        """
        Send check-in to user: create conversation + send push notification.

        Args:
            user_id: User UUID
            display_name: User's display name for personalization
        """
        try:
            # Generate contextual message based on time of day
            message = self.generate_checkin_message(user_id, display_name)

            # Create system-initiated conversation
            conv_result = self.db.table('ai_chat_conversations').insert({
                'user_id': str(user_id),
                'initiated_by': 'system',
                'started_at': datetime.now().isoformat(),
                'last_message_at': datetime.now().isoformat()
            }).execute()

            conversation_id = conv_result.data[0]['id']

            # Save system message
            self.db.table('ai_chat_messages').insert({
                'conversation_id': conversation_id,
                'role': 'system',
                'content': message,
                'created_at': datetime.now().isoformat()
            }).execute()

            # Update last_checkin_at
            self.db.table('user_profiles').update({
                'last_checkin_at': datetime.now().isoformat()
            }).eq('id', str(user_id)).execute()

            # Log to ai_runs for audit trail
            self.db.table('ai_runs').insert({
                'user_id': str(user_id),
                'operation_type': 'checkin_initiated',
                'module': 'checkin_scheduler',
                'status': 'success',
                'metadata': {
                    'conversation_id': conversation_id,
                    'message': message
                }
            }).execute()

            # Send push notification via Expo Push API
            try:
                await self.send_push_notification(user_id, message, str(conversation_id))
            except Exception as push_error:
                logger.error(f"Failed to send push notification to user {user_id}: {push_error}")
                # Don't fail the check-in if push fails - user can still see it in-app

            logger.info(f"✅ Sent check-in to user {user_id}: {message[:50]}...")

        except Exception as e:
            logger.error(f"Error sending check-in to user {user_id}: {e}")

    def generate_checkin_message(self, user_id: UUID, display_name: str) -> str:
        """
        Generate contextual check-in message based on time of day and recent activity.

        Args:
            user_id: User UUID
            display_name: User's display name

        Returns:
            Personalized check-in message
        """
        hour = datetime.now().hour
        morning = hour < 12
        afternoon = 12 <= hour < 17
        evening = hour >= 17

        try:
            # Get recent completions (today)
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            completions_result = self.db.table('subtask_completions') \
                .select('id', count='exact') \
                .eq('user_id', str(user_id)) \
                .gte('completed_at', today_start.isoformat()) \
                .execute()

            completion_count = completions_result.count or 0

            # Get pending binds
            pending_result = self.db.table('subtask_instances') \
                .select('id', count='exact') \
                .eq('user_id', str(user_id)) \
                .eq('status', 'active') \
                .execute()

            pending_count = pending_result.count or 0

        except Exception as e:
            logger.error(f"Error getting user activity for {user_id}: {e}")
            completion_count = 0
            pending_count = 0

        # Generate message based on time and activity
        if morning and completion_count == 0:
            return f"Good morning, {display_name}! Ready to tackle your {pending_count} binds today? 🌅"
        elif morning and completion_count > 0:
            return f"Great start, {display_name}! You've already completed {completion_count} binds this morning. Keep it up! ⚡"
        elif afternoon and completion_count > 0:
            return f"Nice work, {display_name}! You've completed {completion_count} binds today. Keep the momentum going? 💪"
        elif afternoon and completion_count == 0:
            return f"Hey {display_name}! How's your day going? You have {pending_count} binds waiting. Need help getting started? 🎯"
        elif evening and completion_count > 0:
            return f"Solid day, {display_name}! You completed {completion_count} binds. How are you feeling about your progress? 🌟"
        else:
            return f"Evening check-in, {display_name}! How did today go? Let's reflect on your wins and plan for tomorrow. 🌙"

    async def send_push_notification(self, user_id: UUID, message: str, conversation_id: str):
        """
        Send push notification via Expo Push API.

        Args:
            user_id: User UUID
            message: Notification message
            conversation_id: ID of the conversation to open
        """
        import httpx

        # Get user's push token
        try:
            user_result = self.db.table('user_profiles') \
                .select('expo_push_token') \
                .eq('id', str(user_id)) \
                .single() \
                .execute()

            push_token = user_result.data.get('expo_push_token') if user_result.data else None

            if not push_token:
                logger.info(f"No push token for user {user_id}, skipping notification")
                return

            # Validate Expo push token format
            if not push_token.startswith('ExponentPushToken['):
                logger.warning(f"Invalid push token format for user {user_id}: {push_token}")
                return

        except Exception as e:
            logger.error(f"Error getting push token for user {user_id}: {e}")
            return

        # Send push notification via Expo Push API
        try:
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
                        'priority': 'high',
                        'channelId': 'default'
                    },
                    headers={
                        'Accept': 'application/json',
                        'Accept-Encoding': 'gzip, deflate',
                        'Content-Type': 'application/json'
                    }
                )

                if response.status_code == 200:
                    result = response.json()
                    if result.get('data', {}).get('status') == 'ok':
                        logger.info(f"✅ Push notification sent to user {user_id}")
                    else:
                        logger.warning(f"Push notification failed for user {user_id}: {result}")
                else:
                    logger.error(f"Push notification API error for user {user_id}: {response.status_code} - {response.text}")

        except Exception as e:
            logger.error(f"Error sending push notification to user {user_id}: {e}")
            # Don't raise - notification failure shouldn't break check-in
