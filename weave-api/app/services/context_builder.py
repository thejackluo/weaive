"""
Context Builder Service (Story 6.2)

Assembles canonical user context snapshots for AI prompt enrichment.
Includes goals, completions, journal entries, identity, and consistency metrics.

Performance target: <500ms context assembly (P95)
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class ContextBuilderService:
    """
    Builds structured user context for AI prompts.

    Assembles:
    - Active goals (max 3, sorted by created_at DESC)
    - Recent completions (last 7 days with proof types)
    - Journal entries (last 3 with fulfillment scores)
    - Identity document (Dream Self personality)
    - Consistency metrics (streak, completion rate)

    Usage:
        service = ContextBuilderService(db)
        context = await service.build_context(user_id)
    """

    def __init__(self, db: SupabaseClient):
        """
        Initialize ContextBuilderService.

        Args:
            db: Supabase client for database access
        """
        self.db = db

    async def build_context(self, user_id: str) -> Optional[Dict]:
        """
        Build structured user context snapshot.

        Args:
            user_id: User ID (from user_profiles.id)

        Returns:
            Structured JSON context dict with user data, or None if timeout/error

        Performance:
            Target: <500ms (P95)
            Optimizations: Parallel queries, selective loading, indexes
        """
        try:
            logger.info(f"Building context for user {user_id}")
            start_time = datetime.now(timezone.utc)

            # Build context sections (can be parallelized in future optimization)
            goals = await self._fetch_goals(user_id)
            recent_activity = await self._fetch_recent_activity(user_id)
            journal = await self._fetch_journal_entries(user_id)
            identity = await self._fetch_identity(user_id)
            metrics = await self._calculate_metrics(user_id)

            # Assemble context
            context = {
                "user_id": user_id,
                "assembled_at": datetime.now(timezone.utc).isoformat(),
                "goals": goals,
                "recent_activity": recent_activity,
                "journal": journal,
                "identity": identity,
                "metrics": metrics,
                "recent_wins": self._extract_recent_wins(goals, recent_activity, metrics),
            }

            # Log performance
            assembly_time_ms = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
            logger.info(f"Context built in {assembly_time_ms:.0f}ms for user {user_id}")

            return context

        except TimeoutError as e:
            logger.warning(f"Context building timeout for user {user_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Context building failed for user {user_id}: {e}")
            return None

    async def _fetch_goals(self, user_id: str) -> List[Dict]:
        """
        Fetch active goals (max 3, newest first).

        Returns:
            List of goal dicts with id, title, active_binds, completion_rate, current_streak
        """
        try:
            response = (
                self.db.table("goals")
                .select("*")
                .eq("user_id", user_id)
                .eq("status", "active")
                .order("created_at", desc=True)
                .limit(3)
                .execute()
            )

            goals = []
            for goal_data in response.data:
                goals.append({
                    "id": goal_data["id"],
                    "title": goal_data["title"],
                    "active_binds": 0,  # TODO: Count from subtask_templates
                    "completion_rate": 0.0,  # TODO: Calculate from completions
                    "current_streak": 0,  # TODO: Calculate from daily completions
                })

            return goals

        except Exception as e:
            logger.error(f"Failed to fetch goals for user {user_id}: {e}")
            return []

    async def _fetch_recent_activity(self, user_id: str) -> Dict:
        """
        Fetch recent completions (last 7 days).

        Returns:
            Dict with completions_last_7_days, proof_types, most_recent_completion
        """
        try:
            seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

            response = (
                self.db.table("subtask_completions")
                .select("*")
                .eq("user_id", user_id)
                .gte("completed_at", seven_days_ago)
                .order("completed_at", desc=True)
                .execute()
            )

            completions = response.data
            proof_types = list(set(c.get("proof_type") for c in completions if c.get("proof_type")))

            most_recent = None
            if completions:
                most_recent = {
                    "bind_title": completions[0].get("bind_title", "Unknown"),
                    "completed_at": completions[0]["completed_at"],
                    "proof_type": completions[0].get("proof_type"),
                }

            return {
                "completions_last_7_days": len(completions),
                "proof_types": proof_types,
                "most_recent_completion": most_recent,
            }

        except Exception as e:
            logger.error(f"Failed to fetch recent activity for user {user_id}: {e}")
            return {
                "completions_last_7_days": 0,
                "proof_types": [],
                "most_recent_completion": None,
            }

    async def _fetch_journal_entries(self, user_id: str) -> List[Dict]:
        """
        Fetch last 3 journal entries (newest first).

        Returns:
            List of journal entry dicts with date, fulfillment_score, entry_preview
        """
        try:
            response = (
                self.db.table("journal_entries")
                .select("*")
                .eq("user_id", user_id)
                .order("local_date", desc=True)
                .limit(3)
                .execute()
            )

            journal_entries = []
            for entry in response.data:
                # Extract preview from default_responses.today_reflection if available
                preview = ""
                if entry.get("default_responses") and isinstance(entry["default_responses"], dict):
                    preview = entry["default_responses"].get("today_reflection", "")[:100]

                journal_entries.append({
                    "date": entry.get("local_date"),
                    "fulfillment_score": entry.get("fulfillment_score"),
                    "entry_preview": preview,
                    "ai_feedback_received": entry.get("ai_feedback_received", False),
                })

            return journal_entries

        except Exception as e:
            logger.error(f"Failed to fetch journal entries for user {user_id}: {e}")
            return []

    async def _fetch_identity(self, user_id: str) -> Dict:
        """
        Fetch Dream Self personality from identity_docs.

        Returns:
            Dict with dream_self_name, archetype, personality_traits, speaking_style
            Or default persona if no Dream Self doc exists
        """
        try:
            response = (
                self.db.table("identity_docs")
                .select("*")
                .eq("user_id", user_id)
                .eq("type", "dream_self")
                .execute()
            )

            if response.data:
                doc = response.data[0]
                content = doc.get("content", {})

                return {
                    "dream_self_name": content.get("dream_self_name", "Your Guide"),
                    "archetype": content.get("archetype", "Coach"),
                    "personality_traits": content.get("personality_traits", []),
                    "speaking_style": content.get("speaking_style", "Supportive and encouraging"),
                }
            else:
                # Default persona (no Dream Self doc yet)
                return {
                    "dream_self_name": "Weave",
                    "archetype": "Coach",
                    "personality_traits": ["supportive", "encouraging", "motivating"],
                    "speaking_style": "Friendly and empowering",
                }

        except Exception as e:
            logger.error(f"Failed to fetch identity for user {user_id}: {e}")
            return {
                "dream_self_name": "Weave",
                "archetype": "Coach",
                "personality_traits": [],
                "speaking_style": "Supportive",
            }

    async def _calculate_metrics(self, user_id: str) -> Dict:
        """
        Calculate consistency metrics.

        Returns:
            Dict with current_streak, longest_streak, overall_completion_rate, goals_completed, days_active
        """
        try:
            # TODO: Implement actual streak and completion rate calculations
            # For MVP, return placeholder metrics

            return {
                "current_streak": 0,
                "longest_streak": 0,
                "overall_completion_rate": 0.0,
                "goals_completed": 0,
                "days_active": 0,
            }

        except Exception as e:
            logger.error(f"Failed to calculate metrics for user {user_id}: {e}")
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "overall_completion_rate": 0.0,
                "goals_completed": 0,
                "days_active": 0,
            }

    def _extract_recent_wins(self, goals: List[Dict], recent_activity: Dict, metrics: Dict) -> List[str]:
        """
        Extract recent wins from context data.

        Args:
            goals: List of active goals
            recent_activity: Recent completion data
            metrics: Consistency metrics

        Returns:
            List of win strings (e.g., "10-day streak achieved", "First goal completed")
        """
        wins = []

        # Check for streaks
        if metrics.get("current_streak", 0) >= 7:
            wins.append(f"{metrics['current_streak']}-day streak achieved")

        # Check for recent completions
        if recent_activity.get("completions_last_7_days", 0) >= 5:
            wins.append(f"{recent_activity['completions_last_7_days']} completions in last 7 days")

        # Check for completed goals
        if metrics.get("goals_completed", 0) > 0:
            wins.append(f"{metrics['goals_completed']} goals completed")

        return wins
