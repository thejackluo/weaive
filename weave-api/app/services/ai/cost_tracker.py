"""
Dual AI Cost Tracking and Budget Enforcement

Tracks both application-wide AND per-user AI costs with tier-aware budgets.

Features:
- Total daily cost tracking (application-wide budget: $83.33/day)
- Per-user daily cost tracking (free: $0.02/day, paid: $0.10/day)
- Budget alerts at 80% threshold
- Auto-throttle when either budget exceeded
- Real-time cost queries from ai_runs table
"""

import logging
from datetime import date, datetime, timedelta, timezone

from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class CostTracker:
    """
    Tracks AI costs and enforces dual budgets (total + per-user).

    Budget limits:
    - Application-wide: $83.33/day ($2,500/month ÷ 30 days)
    - Free users: $0.02/day (~$0.60/month)
    - Paid users: $0.10/day (~$3.00/month)
    """

    # Budget constants
    DAILY_BUDGET_USD = 83.33  # Application-wide daily budget
    FREE_USER_DAILY_BUDGET_USD = 0.02  # Free tier per-user daily budget
    PAID_USER_DAILY_BUDGET_USD = 0.10  # Paid tier per-user daily budget
    ALERT_THRESHOLD = 0.80  # Alert at 80% of budget

    def __init__(self, db: SupabaseClient):
        """
        Initialize cost tracker.

        Args:
            db: Supabase client for querying ai_runs table
        """
        self.db = db

    def get_total_daily_cost(self) -> float:
        """
        Get total application-wide cost for today (UTC).

        Sums all cost_estimate values from ai_runs where created_at is today (UTC).
        Uses UTC timezone to ensure consistent daily boundaries across all users.

        Returns:
            Total cost in USD for today across all users
        """
        try:
            # Use UTC for consistent daily boundaries
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_start = today_start + timedelta(days=1)

            result = self.db.table('ai_runs') \
                .select('cost_estimate') \
                .gte('created_at', today_start.isoformat()) \
                .lt('created_at', tomorrow_start.isoformat()) \
                .execute()

            total = sum(
                row.get('cost_estimate', 0) or 0
                for row in result.data
            )

            logger.debug(f"Total daily cost (UTC): ${total:.6f}")
            return float(total)

        except Exception as e:
            logger.error(f"Error getting total daily cost: {e}")
            return 0.0  # Fail open (don't block on error)

    def get_user_daily_cost(self, user_id: str) -> float:
        """
        Get per-user cost for today (UTC).

        Sums cost_estimate for specific user where created_at is today (UTC).
        Uses UTC timezone to ensure consistent daily boundaries.

        Args:
            user_id: User ID (from user_profiles.id)

        Returns:
            Total cost in USD for this user today
        """
        try:
            # Use UTC for consistent daily boundaries
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_start = today_start + timedelta(days=1)

            result = self.db.table('ai_runs') \
                .select('cost_estimate') \
                .eq('user_id', user_id) \
                .gte('created_at', today_start.isoformat()) \
                .lt('created_at', tomorrow_start.isoformat()) \
                .execute()

            total = sum(
                row.get('cost_estimate', 0) or 0
                for row in result.data
            )

            logger.debug(f"User {user_id} daily cost (UTC): ${total:.6f}")
            return float(total)

        except Exception as e:
            logger.error(f"Error getting user daily cost for {user_id}: {e}")
            return 0.0  # Fail open

    def is_total_budget_exceeded(self) -> bool:
        """
        Check if application-wide daily budget is exceeded.

        Returns:
            True if total daily cost >= $83.33
        """
        total_cost = self.get_total_daily_cost()

        if total_cost >= self.DAILY_BUDGET_USD:
            logger.error(
                f"❌ Application-wide daily budget EXCEEDED: "
                f"${total_cost:.2f} / ${self.DAILY_BUDGET_USD:.2f}"
            )
            return True

        elif total_cost >= self.DAILY_BUDGET_USD * self.ALERT_THRESHOLD:
            percent = (total_cost / self.DAILY_BUDGET_USD) * 100
            logger.warning(
                f"⚠️  Application-wide budget at {percent:.1f}%: "
                f"${total_cost:.2f} / ${self.DAILY_BUDGET_USD:.2f}"
            )

        return False

    def is_user_budget_exceeded(
        self,
        user_id: str,
        user_tier: str = 'free'
    ) -> bool:
        """
        Check if per-user daily budget is exceeded.

        Args:
            user_id: User ID
            user_tier: User tier ('free' or 'paid')

        Returns:
            True if user's daily cost >= tier budget
        """
        user_cost = self.get_user_daily_cost(user_id)

        # Get tier-specific budget
        tier_budget = (
            self.PAID_USER_DAILY_BUDGET_USD
            if user_tier == 'paid'
            else self.FREE_USER_DAILY_BUDGET_USD
        )

        if user_cost >= tier_budget:
            logger.error(
                f"❌ User {user_id} ({user_tier}) daily budget EXCEEDED: "
                f"${user_cost:.4f} / ${tier_budget:.4f}"
            )
            return True

        elif user_cost >= tier_budget * self.ALERT_THRESHOLD:
            percent = (user_cost / tier_budget) * 100
            logger.warning(
                f"⚠️  User {user_id} ({user_tier}) budget at {percent:.1f}%: "
                f"${user_cost:.4f} / ${tier_budget:.4f}"
            )

        return False

    def record_cost(
        self,
        run_id: str,
        input_tokens: int,
        output_tokens: int,
        model: str,
        cost_usd: float
    ) -> None:
        """
        Record cost for an AI run (updates ai_runs table).

        Args:
            run_id: AI run ID
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model used
            cost_usd: Cost in USD
        """
        try:
            self.db.table('ai_runs') \
                .update({
                    'input_tokens': input_tokens,
                    'output_tokens': output_tokens,
                    'model': model,
                    'cost_estimate': cost_usd,
                }) \
                .eq('id', run_id) \
                .execute()

            logger.debug(
                f"Recorded cost for run {run_id}: ${cost_usd:.6f} "
                f"({input_tokens} in + {output_tokens} out tokens)"
            )

        except Exception as e:
            logger.error(f"Error recording cost for run {run_id}: {e}")
            # Don't raise - this is tracking only, shouldn't block AI generation

    def get_cost_stats(self, days: int = 7) -> dict:
        """
        Get cost statistics for analysis.

        Args:
            days: Number of days to analyze (default: 7)

        Returns:
            Dict with cost breakdown by provider, model, user tier
        """
        try:
            # Query last N days
            cutoff_date = datetime.now().date()
            cutoff_date = date(cutoff_date.year, cutoff_date.month, cutoff_date.day - days + 1)
            cutoff_str = cutoff_date.isoformat()

            result = self.db.table('ai_runs') \
                .select('provider, model, cost_estimate, user_id, created_at') \
                .gte('created_at', f'{cutoff_str}T00:00:00') \
                .execute()

            # Aggregate stats
            total_cost = 0.0
            provider_costs = {}
            model_costs = {}

            for row in result.data:
                cost = row.get('cost_estimate', 0) or 0
                provider = row.get('provider', 'unknown')
                model = row.get('model', 'unknown')

                total_cost += cost
                provider_costs[provider] = provider_costs.get(provider, 0) + cost
                model_costs[model] = model_costs.get(model, 0) + cost

            return {
                'total_cost': total_cost,
                'provider_breakdown': provider_costs,
                'model_breakdown': model_costs,
                'days': days,
            }

        except Exception as e:
            logger.error(f"Error getting cost stats: {e}")
            return {
                'total_cost': 0.0,
                'provider_breakdown': {},
                'model_breakdown': {},
                'days': days,
                'error': str(e),
            }
