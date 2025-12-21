"""
Goal Factory - Data factory for Python API testing

Generates random goal data using faker for deterministic tests.
Follows data-factories.md patterns from TEA knowledge base.

Generated: 2025-12-20
"""

import random
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

# TODO: Install faker
# pip install faker
# from faker import Faker
# fake = Faker()


def create_goal(overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Creates a single goal with optional overrides

    Args:
        overrides: Dictionary of fields to override

    Returns:
        Complete goal dictionary with all required fields

    Example:
        goal = create_goal({"title": "Custom Goal"})
        new_goal = create_goal({"consistency_7d": None})  # New goal
    """
    if overrides is None:
        overrides = {}

    # TODO: Replace with faker after installation
    default_goal = {
        "id": f"goal-{random.randint(1000, 9999)}",
        "user_id": overrides.get("user_id", "test-user-id"),
        "title": "Sample Goal",
        "description": "Sample goal description",
        "status": "active",
        "created_at": datetime.now() - timedelta(days=random.randint(7, 60)),
        "updated_at": datetime.now() - timedelta(days=random.randint(0, 5)),
    }

    return {**default_goal, **overrides}


def create_goals(count: int = 3, user_id: str = "test-user-id") -> list[Dict[str, Any]]:
    """
    Creates multiple goals

    Args:
        count: Number of goals to create
        user_id: User ID for all goals

    Returns:
        List of goal dictionaries

    Example:
        goals = create_goals(3)
        many_goals = create_goals(10, user_id="user-123")
    """
    return [
        create_goal(
            {
                "user_id": user_id,
                "title": f"Goal {i + 1}",
                "updated_at": datetime.now() - timedelta(days=i),
            }
        )
        for i in range(count)
    ]


def create_new_goal(overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Creates a new goal (without 7-day consistency data)

    Args:
        overrides: Dictionary of fields to override

    Returns:
        Goal with null consistency (represents new goal)
    """
    if overrides is None:
        overrides = {}

    return create_goal(
        {
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            **overrides,
        }
    )


def create_daily_aggregate(
    goal_id: str,
    user_id: str,
    local_date: datetime,
    consistency_score: float,
) -> Dict[str, Any]:
    """
    Creates a daily aggregate record

    Args:
        goal_id: Goal ID
        user_id: User ID
        local_date: Date for aggregate
        consistency_score: Consistency score (0-100)

    Returns:
        Daily aggregate dictionary

    Example:
        aggregate = create_daily_aggregate(
            goal_id="goal-1",
            user_id="user-1",
            local_date=datetime.now() - timedelta(days=1),
            consistency_score=85.5
        )
    """
    return {
        "id": f"agg-{random.randint(1000, 9999)}",
        "user_id": user_id,
        "goal_id": goal_id,
        "local_date": local_date.date(),
        "consistency_score": consistency_score,
        "created_at": datetime.now(),
    }


def create_daily_aggregates_for_goal(
    goal_id: str,
    user_id: str,
    days: int = 7,
    avg_consistency: float = 80.0,
) -> list[Dict[str, Any]]:
    """
    Creates daily aggregates for a goal over N days

    Args:
        goal_id: Goal ID
        user_id: User ID
        days: Number of days of data
        avg_consistency: Average consistency score

    Returns:
        List of daily aggregate dictionaries

    Example:
        # Create 7 days of data with 85% average consistency
        aggregates = create_daily_aggregates_for_goal(
            goal_id="goal-1",
            user_id="user-1",
            days=7,
            avg_consistency=85.0
        )
    """
    aggregates = []
    for i in range(days):
        # Add some variance around average
        variance = random.uniform(-10, 10)
        score = max(0, min(100, avg_consistency + variance))

        aggregates.append(
            create_daily_aggregate(
                goal_id=goal_id,
                user_id=user_id,
                local_date=datetime.now() - timedelta(days=i),
                consistency_score=score,
            )
        )

    return aggregates


def create_subtask_template(
    goal_id: str,
    user_id: str,
    is_active: bool = True,
    overrides: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Creates a subtask template (bind)

    Args:
        goal_id: Goal ID
        user_id: User ID
        is_active: Whether bind is active
        overrides: Dictionary of fields to override

    Returns:
        Subtask template dictionary

    Example:
        bind = create_subtask_template(
            goal_id="goal-1",
            user_id="user-1",
            is_active=True,
            overrides={"title": "Morning run"}
        )
    """
    if overrides is None:
        overrides = {}

    default_template = {
        "id": f"template-{random.randint(1000, 9999)}",
        "goal_id": goal_id,
        "user_id": user_id,
        "title": "Sample Bind",
        "description": "Sample bind description",
        "is_active": is_active,
        "created_at": datetime.now(),
    }

    return {**default_template, **overrides}


def create_subtask_templates_for_goal(
    goal_id: str,
    user_id: str,
    active_count: int = 3,
    inactive_count: int = 0,
) -> list[Dict[str, Any]]:
    """
    Creates multiple subtask templates for a goal

    Args:
        goal_id: Goal ID
        user_id: User ID
        active_count: Number of active binds
        inactive_count: Number of inactive binds

    Returns:
        List of subtask template dictionaries

    Example:
        # Create 3 active and 2 inactive binds
        binds = create_subtask_templates_for_goal(
            goal_id="goal-1",
            user_id="user-1",
            active_count=3,
            inactive_count=2
        )
    """
    templates = []

    for i in range(active_count):
        templates.append(
            create_subtask_template(
                goal_id=goal_id,
                user_id=user_id,
                is_active=True,
                overrides={"title": f"Active Bind {i + 1}"},
            )
        )

    for i in range(inactive_count):
        templates.append(
            create_subtask_template(
                goal_id=goal_id,
                user_id=user_id,
                is_active=False,
                overrides={"title": f"Inactive Bind {i + 1}"},
            )
        )

    return templates


"""
TODO: After installing faker, replace implementations:

from faker import Faker
fake = Faker()

def create_goal(overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    if overrides is None:
        overrides = {}

    default_goal = {
        "id": fake.uuid4(),
        "user_id": overrides.get("user_id", fake.uuid4()),
        "title": fake.sentence(nb_words=3),
        "description": fake.paragraph(),
        "status": "active",
        "created_at": fake.date_time_between(start_date="-60d", end_date="-7d"),
        "updated_at": fake.date_time_between(start_date="-7d", end_date="now"),
    }

    return {**default_goal, **overrides}
"""
