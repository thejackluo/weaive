"""
Response Quality Checker (Story 6.2)

Validates AI responses for specificity and context usage.
Detects generic responses that don't reference user's actual data.
"""

import logging
import re
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Generic phrases that indicate low-quality responses (without specific data)
GENERIC_PHRASES = [
    r"stay motivated",
    r"keep going",
    r"you can do it",
    r"don't give up",
    r"believe in yourself",
    r"one day at a time",
    r"take it slow",
    r"be patient",
    r"trust the process",
    r"stay consistent",
    r"hang in there",
    r"you've got this",
    r"stay focused",
    r"keep pushing",
    r"stay strong",
]


class ResponseQualityChecker:
    """
    Checks AI response quality and detects generic responses.

    Story 6.2: Ensures AI responses reference user's actual data (goals, streaks, completions)
    rather than providing generic motivational advice.

    Usage:
        checker = ResponseQualityChecker()
        quality = checker.check_response(ai_response, user_context)
        if quality == 'generic':
            # Retry with stronger prompt
    """

    def check_response(
        self,
        response: str,
        user_context: Optional[Dict]
    ) -> str:
        """
        Check response quality and return quality flag.

        Args:
            response: AI-generated response text
            user_context: User context snapshot used for generation

        Returns:
            Quality flag: 'excellent', 'specific', or 'generic'
        """
        if not user_context:
            # No context provided - can't check for specificity
            return 'specific'  # Assume OK

        if self.is_generic_response(response, user_context):
            logger.warning("🚨 Generic response detected (no user data references)")
            return 'generic'

        if self.is_excellent_response(response, user_context):
            logger.info("✨ Excellent response (multiple data references)")
            return 'excellent'

        # Specific but not excellent
        return 'specific'

    def is_generic_response(
        self,
        response: str,
        user_context: Dict
    ) -> bool:
        """
        Check if response is too generic (doesn't reference user's data).

        A response is generic if it:
        - Contains generic motivational phrases AND
        - Does NOT mention specific user data (goal names, streaks, numbers)

        Args:
            response: AI response text
            user_context: User context snapshot

        Returns:
            True if response is too generic
        """
        # Check for generic phrases
        has_generic_phrase = False
        for pattern in GENERIC_PHRASES:
            if re.search(pattern, response, re.IGNORECASE):
                has_generic_phrase = True
                break

        if not has_generic_phrase:
            # No generic phrases - response is OK
            return False

        # Has generic phrase - check if it's followed by specific data
        if self.mentions_user_data(response, user_context):
            # Generic phrase + specific data = OK (e.g., "Stay consistent on your 10-day workout streak")
            return False

        # Generic phrase + no specific data = TOO GENERIC
        return True

    def is_excellent_response(
        self,
        response: str,
        user_context: Dict
    ) -> bool:
        """
        Check if response is excellent (cites multiple data points).

        An excellent response mentions:
        - Goal names + activity metrics OR
        - Streak + completion count OR
        - Multiple specific data references

        Args:
            response: AI response text
            user_context: User context snapshot

        Returns:
            True if response is excellent quality
        """
        references = 0

        # Check for goal name mentions
        goals = user_context.get('goals', [])
        for goal in goals:
            goal_title = goal.get('title', '')
            if goal_title.lower() in response.lower():
                references += 1

        # Check for streak mention
        metrics = user_context.get('metrics', {})
        current_streak = metrics.get('current_streak', 0)
        if current_streak > 0 and 'streak' in response.lower():
            references += 1

        # Check for completion count mention
        recent_activity = user_context.get('recent_activity', {})
        completions_count = recent_activity.get('completions_last_7_days', 0)
        if completions_count > 0 and str(completions_count) in response:
            references += 1

        # Excellent if 2+ specific data references
        return references >= 2

    def mentions_user_data(
        self,
        response: str,
        user_context: Dict
    ) -> bool:
        """
        Check if response mentions specific user data.

        Looks for:
        - Goal names
        - Bind titles
        - Streak mentions with numbers
        - Completion counts
        - Specific dates or day counts

        Args:
            response: AI response text
            user_context: User context snapshot

        Returns:
            True if response contains specific user data
        """
        response_lower = response.lower()

        # Check for goal names
        goals = user_context.get('goals', [])
        for goal in goals:
            goal_title = goal.get('title', '')
            if goal_title.lower() in response_lower:
                logger.debug(f"✅ Found goal reference: {goal_title}")
                return True

        # Check for bind titles (from recent completions)
        recent_activity = user_context.get('recent_activity', {})
        most_recent = recent_activity.get('most_recent_completion')
        if most_recent:
            bind_title = most_recent.get('bind_title', '')
            if bind_title.lower() in response_lower:
                logger.debug(f"✅ Found bind reference: {bind_title}")
                return True

        # Check for streak mentions with numbers
        if 'streak' in response_lower:
            # Look for patterns like "10-day streak", "streak of 5 days"
            if re.search(r'\d+[\s-]+(day|week)s?\s+streak', response_lower, re.IGNORECASE):
                logger.debug("✅ Found specific streak reference")
                return True

        # Check for completion counts (e.g., "5 completions", "completed 10 times")
        if re.search(r'\d+\s+(completion|bind|task)', response_lower, re.IGNORECASE):
            logger.debug("✅ Found completion count reference")
            return True

        # Check for specific numbers + time units (e.g., "in the last 7 days")
        if re.search(r'\d+\s+(day|week|month)s?', response_lower, re.IGNORECASE):
            logger.debug("✅ Found time reference")
            return True

        logger.debug("❌ No specific user data found in response")
        return False

    def build_retry_prompt(
        self,
        original_prompt: str,
        user_context: Dict
    ) -> str:
        """
        Build a stronger prompt for retry attempt.

        Adds explicit instructions to reference specific data.

        Args:
            original_prompt: Original user prompt
            user_context: User context snapshot

        Returns:
            Enhanced prompt with stronger specificity instructions
        """
        retry_instructions = """
🚨 CRITICAL INSTRUCTION: Your previous response was too generic. You MUST reference SPECIFIC data from the user's context:

REQUIRED REFERENCES (include at least 2):
- Mention user's goal names by title
- Cite their current streak (if > 0)
- Reference their completion count in last 7 days
- Acknowledge their recent activity patterns
- Use specific numbers (days, completions, percentages)

❌ AVOID generic advice without data:
- "Stay motivated" without mentioning their streak
- "Keep going" without acknowledging their progress
- "You can do it" without citing their accomplishments

✅ GOOD EXAMPLES:
- "Your 10-day streak on 'Morning workout' shows real consistency"
- "You've completed 12 binds in the last week - that's strong momentum"
- "I see you completed 'Evening reflection' yesterday with a photo proof"

NOW RESPOND TO THE USER'S MESSAGE WITH SPECIFIC DATA:
"""

        return f"{retry_instructions}\n\n{original_prompt}"
