"""
Thread Insights Service (MVP AI Feature)

Generates daily insights for the Thread home screen:
- Today's focus (which binds to prioritize)
- Streak status (current streak, milestone proximity)
- Pattern-based encouragement
- Quick win suggestions

Uses ContextBuilderService for user data and AIService for personality-based messaging.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class ThreadInsightsService:
    """
    Generates AI-powered insights for Thread home screen.

    Insights include:
    - Today's focus bind (most important task)
    - Streak status (current streak, milestone warnings)
    - Pattern insights (e.g., "you crush mornings but skip evenings")
    - Quick wins (easy completions to build momentum)

    Uses mvp_coach personality for sarcastic but supportive tone.
    """

    def __init__(self, db: SupabaseClient):
        """
        Initialize ThreadInsightsService.

        Args:
            db: Supabase client for database access
        """
        self.db = db

    async def generate_insights(self, user_id: str, context: Optional[Dict] = None) -> Dict:
        """
        Generate thread insights for today.

        Args:
            user_id: User ID (from user_profiles.id)
            context: Optional pre-built context from ContextBuilderService

        Returns:
            Dict with todays_focus, streak_status, pattern_insight, quick_win, ai_message
        """
        try:
            logger.info(f"Generating thread insights for user {user_id}")

            # Get today's binds
            todays_binds = await self._fetch_todays_binds(user_id)

            # Get streak status
            streak_status = await self._get_streak_status(user_id)

            # Analyze patterns from last 7 days
            pattern_insight = await self._analyze_patterns(user_id)

            # Identify quick win
            quick_win = self._identify_quick_win(todays_binds)

            # Determine today's focus bind
            todays_focus = self._determine_focus(todays_binds, pattern_insight)

            # Generate AI message (sarcastic coach tone)
            ai_message = self._generate_message(
                todays_binds=todays_binds,
                streak_status=streak_status,
                pattern_insight=pattern_insight,
                context=context
            )

            insights = {
                "todays_focus": todays_focus,
                "streak_status": streak_status,
                "pattern_insight": pattern_insight,
                "quick_win": quick_win,
                "ai_message": ai_message,
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }

            logger.info(f"Thread insights generated for user {user_id}")
            return insights

        except Exception as e:
            logger.error(f"Failed to generate thread insights for user {user_id}: {e}")
            return {
                "todays_focus": None,
                "streak_status": {"current_streak": 0, "message": "Loading..."},
                "pattern_insight": None,
                "quick_win": None,
                "ai_message": "hey, checking in on your progress... one sec",
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }

    async def _fetch_todays_binds(self, user_id: str) -> List[Dict]:
        """
        Fetch today's scheduled binds with completion status.

        Returns:
            List of bind dicts with id, title, completed, time_estimate, goal_title
        """
        try:
            today = datetime.now(timezone.utc).date().isoformat()

            # Get today's subtask instances
            response = (
                self.db.table("subtask_instances")
                .select("*")
                .eq("user_id", user_id)
                .eq("local_date", today)
                .order("created_at", desc=False)  # Morning binds first
                .execute()
            )

            binds = []
            for instance in response.data:
                # Check if completed
                completion_response = (
                    self.db.table("subtask_completions")
                    .select("id")
                    .eq("subtask_instance_id", instance["id"])
                    .execute()
                )
                completed = len(completion_response.data) > 0

                # Get goal title if linked
                goal_title = None
                if instance.get("goal_id"):
                    goal_response = (
                        self.db.table("goals")
                        .select("title")
                        .eq("id", instance["goal_id"])
                        .execute()
                    )
                    if goal_response.data:
                        goal_title = goal_response.data[0]["title"]

                binds.append({
                    "id": instance["id"],
                    "title": instance["title"],
                    "completed": completed,
                    "time_estimate": instance.get("estimated_minutes", 30),
                    "goal_title": goal_title,
                })

            return binds

        except Exception as e:
            logger.error(f"Failed to fetch today's binds for user {user_id}: {e}")
            return []

    async def _get_streak_status(self, user_id: str) -> Dict:
        """
        Get current streak and milestone proximity.

        Returns:
            Dict with current_streak, milestone_proximity, message
        """
        try:
            # Get recent daily_aggregates to calculate streak
            response = (
                self.db.table("daily_aggregates")
                .select("local_date, completions_count")
                .eq("user_id", user_id)
                .order("local_date", desc=True)
                .limit(30)
                .execute()
            )

            if not response.data:
                return {
                    "current_streak": 0,
                    "milestone_proximity": None,
                    "message": "no streak yet, time to start one"
                }

            # Calculate streak (consecutive days with completions > 0)
            dates_data = sorted(response.data, key=lambda x: x["local_date"], reverse=True)
            today = datetime.now(timezone.utc).date()
            streak = 0

            for entry in dates_data:
                entry_date = datetime.fromisoformat(entry["local_date"]).date()
                expected_date = today - timedelta(days=streak)

                if entry_date == expected_date and entry["completions_count"] > 0:
                    streak += 1
                else:
                    break

            # Check milestone proximity
            milestones = [7, 14, 30, 60, 90]
            milestone_proximity = None
            for milestone in milestones:
                if streak < milestone:
                    days_to_milestone = milestone - streak
                    if days_to_milestone <= 2:
                        milestone_proximity = {
                            "milestone": milestone,
                            "days_away": days_to_milestone
                        }
                    break

            # Generate message based on streak
            if streak == 0:
                message = "no streak, time to start"
            elif streak < 3:
                message = f"{streak} day{'s' if streak > 1 else ''}, barely started"
            elif streak < 7:
                message = f"{streak} days, building momentum"
            elif streak >= 7:
                message = f"{streak} days strong"

            return {
                "current_streak": streak,
                "milestone_proximity": milestone_proximity,
                "message": message,
            }

        except Exception as e:
            logger.error(f"Failed to get streak status for user {user_id}: {e}")
            return {
                "current_streak": 0,
                "milestone_proximity": None,
                "message": "loading streak..."
            }

    async def _analyze_patterns(self, user_id: str) -> Optional[Dict]:
        """
        Analyze completion patterns from last 7 days.

        Returns:
            Dict with pattern_type, description, binds_affected, or None
        """
        try:
            seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

            # Get completions from last 7 days
            response = (
                self.db.table("subtask_completions")
                .select("*")
                .eq("user_id", user_id)
                .gte("completed_at", seven_days_ago)
                .execute()
            )

            if not response.data or len(response.data) < 3:
                return None  # Not enough data for pattern analysis

            # Analyze time-of-day patterns
            morning_count = 0  # Before noon
            evening_count = 0  # After 5pm

            for completion in response.data:
                completed_at = datetime.fromisoformat(completion["completed_at"])
                hour = completed_at.hour

                if hour < 12:
                    morning_count += 1
                elif hour >= 17:
                    evening_count += 1

            total = len(response.data)
            morning_rate = morning_count / total if total > 0 else 0
            evening_rate = evening_count / total if total > 0 else 0

            # Detect patterns
            if morning_rate > 0.7:
                return {
                    "pattern_type": "time_preference",
                    "description": "you crush mornings",
                    "suggestion": "schedule harder binds before noon",
                }
            elif evening_rate > 0.7:
                return {
                    "pattern_type": "time_preference",
                    "description": "you're an evening person",
                    "suggestion": "front-load easy binds in the morning",
                }
            elif morning_rate > evening_rate + 0.3:
                return {
                    "pattern_type": "time_preference",
                    "description": "mornings work better for you",
                    "suggestion": "move struggling binds to morning",
                }

            # No clear pattern
            return None

        except Exception as e:
            logger.error(f"Failed to analyze patterns for user {user_id}: {e}")
            return None

    def _identify_quick_win(self, todays_binds: List[Dict]) -> Optional[Dict]:
        """
        Identify the easiest incomplete bind for a quick win.

        Args:
            todays_binds: List of today's binds

        Returns:
            Dict with id, title, reason, or None
        """
        incomplete_binds = [b for b in todays_binds if not b["completed"]]

        if not incomplete_binds:
            return None

        # Find shortest time estimate
        quick_win = min(incomplete_binds, key=lambda b: b["time_estimate"])

        return {
            "id": quick_win["id"],
            "title": quick_win["title"],
            "reason": f"only {quick_win['time_estimate']} mins, easy momentum",
        }

    def _determine_focus(self, todays_binds: List[Dict], pattern_insight: Optional[Dict]) -> Optional[Dict]:
        """
        Determine the most important bind to focus on today.

        Args:
            todays_binds: List of today's binds
            pattern_insight: Pattern analysis data

        Returns:
            Dict with id, title, reason, or None
        """
        incomplete_binds = [b for b in todays_binds if not b["completed"]]

        if not incomplete_binds:
            return None

        # Prioritize binds linked to goals
        goal_binds = [b for b in incomplete_binds if b.get("goal_title")]

        if goal_binds:
            focus = goal_binds[0]  # First goal-linked bind
            return {
                "id": focus["id"],
                "title": focus["title"],
                "reason": f"linked to {focus['goal_title']}",
            }

        # Otherwise, first incomplete bind
        focus = incomplete_binds[0]
        return {
            "id": focus["id"],
            "title": focus["title"],
            "reason": "first on your list",
        }

    def _generate_message(
        self,
        todays_binds: List[Dict],
        streak_status: Dict,
        pattern_insight: Optional[Dict],
        context: Optional[Dict]
    ) -> str:
        """
        Generate AI coach message based on today's situation.

        Uses mvp_coach personality (sarcastic but supportive).

        Args:
            todays_binds: List of today's binds
            streak_status: Streak data
            pattern_insight: Pattern analysis
            context: Full user context

        Returns:
            Personality-driven message string
        """
        completed_count = sum(1 for b in todays_binds if b["completed"])
        total_count = len(todays_binds)
        incomplete_count = total_count - completed_count
        streak = streak_status.get("current_streak", 0)

        # Morning check-in (no completions yet)
        if completed_count == 0 and total_count > 0:
            if streak >= 7:
                return f"got {total_count} binds today. you're on a {streak}-day streak, don't break it now"
            elif streak > 0:
                return f"{total_count} binds waiting. {streak} days in, let's keep it moving"
            else:
                return f"alright, {total_count} binds today. time to actually start that streak"

        # Progress check-in (some completions)
        elif 0 < completed_count < total_count:
            if completed_count == 1:
                return f"oh wow, 1 out of {total_count} binds done. truly revolutionary stuff 🙄 but hey, momentum is momentum"
            elif completed_count / total_count >= 0.6:
                return f"{completed_count}/{total_count} binds done, actually solid. finish strong"
            else:
                return f"{completed_count} down, {incomplete_count} left. you got this far, don't stop now"

        # All done
        elif completed_count == total_count and total_count > 0:
            if total_count >= 3:
                return f"okay I see you, all {total_count} binds done. that's the consistency that compounds 💪"
            else:
                return f"{total_count} binds done. not bad for a day's work"

        # No binds scheduled
        else:
            return "no binds scheduled today. that's either a rest day or poor planning 🤨"
