"""Test data factory functions for creating test fixtures.

These factories create mock data for testing without hitting the database.
When test database is configured, these can be extended to create actual records.
"""

from datetime import datetime, timezone
from typing import Any, Dict


def create_test_user(**kwargs: Any) -> Dict[str, Any]:
    """Create a test user fixture.

    Args:
        **kwargs: Override default values

    Returns:
        Dict with user data
    """
    defaults = {
        "id": "test-user-123",
        "email": "test@example.com",
        "timezone": "America/New_York",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "preferences": {"notifications_enabled": True},
    }
    return {**defaults, **kwargs}


def create_test_goal(user_id: str = "test-user-123", **kwargs: Any) -> Dict[str, Any]:
    """Create a test goal fixture.

    Args:
        user_id: User ID who owns this goal
        **kwargs: Override default values

    Returns:
        Dict with goal data
    """
    defaults = {
        "id": "test-goal-456",
        "user_id": user_id,
        "title": "Learn Python Testing",
        "description": "Master pytest and testing patterns",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "target_date": None,
    }
    return {**defaults, **kwargs}


def create_test_subtask(goal_id: str = "test-goal-456", **kwargs: Any) -> Dict[str, Any]:
    """Create a test subtask fixture.

    Args:
        goal_id: Goal ID this subtask belongs to
        **kwargs: Override default values

    Returns:
        Dict with subtask data
    """
    defaults = {
        "id": "test-subtask-789",
        "goal_id": goal_id,
        "title": "Write unit tests",
        "description": "Cover all edge cases",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}


def create_test_journal_entry(user_id: str = "test-user-123", **kwargs: Any) -> Dict[str, Any]:
    """Create a test journal entry fixture.

    Args:
        user_id: User ID who owns this journal entry
        **kwargs: Override default values

    Returns:
        Dict with journal entry data
    """
    defaults = {
        "id": "test-journal-101",
        "user_id": user_id,
        "content": "Today was productive. Completed 3 tasks.",
        "fulfillment_score": 8,
        "local_date": datetime.now(timezone.utc).date().isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}


def create_test_completion(
    subtask_id: str = "test-subtask-789", user_id: str = "test-user-123", **kwargs: Any
) -> Dict[str, Any]:
    """Create a test subtask completion fixture.

    Args:
        subtask_id: Subtask ID that was completed
        user_id: User ID who completed it
        **kwargs: Override default values

    Returns:
        Dict with completion data
    """
    defaults = {
        "id": "test-completion-202",
        "subtask_id": subtask_id,
        "user_id": user_id,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "proof_text": "Finished writing tests",
        "proof_image_url": None,
    }
    return {**defaults, **kwargs}
