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
    """Create a test journal entry fixture (Story 4.1 schema).

    Args:
        user_id: User ID who owns this journal entry
        **kwargs: Override default values

    Returns:
        Dict with journal entry data following Story 4.1 schema
    """
    defaults = {
        "id": "test-journal-101",
        "user_id": user_id,
        "local_date": datetime.now(timezone.utc).date().isoformat(),
        "fulfillment_score": 8,
        "default_responses": {
            "today_reflection": "Today was productive. Completed 3 tasks and made progress on my goals.",
            "tomorrow_focus": "Tomorrow I will focus on finishing the presentation.",
        },
        "custom_responses": {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}


def create_test_journal_entry_with_custom_questions(
    user_id: str = "test-user-123", **kwargs: Any
) -> Dict[str, Any]:
    """Create a test journal entry with custom question responses.

    Args:
        user_id: User ID who owns this journal entry
        **kwargs: Override default values

    Returns:
        Dict with journal entry data including custom responses
    """
    defaults = {
        "id": "test-journal-102",
        "user_id": user_id,
        "local_date": datetime.now(timezone.utc).date().isoformat(),
        "fulfillment_score": 7,
        "default_responses": {
            "today_reflection": "Great day overall!",
            "tomorrow_focus": "Continue the momentum.",
        },
        "custom_responses": {
            "uuid-diet": {"question_text": "Did I stick to my diet?", "response": "Yes"},
            "uuid-energy": {"question_text": "Rate my energy level (1-10)", "response": 9},
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}


def create_custom_reflection_question(**kwargs: Any) -> Dict[str, Any]:
    """Create a custom reflection question definition.

    Args:
        **kwargs: Override default values

    Returns:
        Dict with custom question definition
    """
    defaults = {
        "id": "uuid-123",
        "question": "Did I exercise today?",
        "type": "yes_no",
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


def create_test_identity_doc(user_id: str = "test-user-123", **kwargs: Any) -> Dict[str, Any]:
    """Create a test identity document (Story 6.2 - Dream Self personality).

    Args:
        user_id: User ID who owns this identity document
        **kwargs: Override default values

    Returns:
        Dict with identity document data
    """
    defaults = {
        "id": "test-identity-doc-301",
        "user_id": user_id,
        "type": "dream_self",
        "content": {
            "dream_self_name": "Alex the Disciplined",
            "archetype": "Builder",
            "personality_traits": ["supportive", "analytical", "growth-focused"],
            "speaking_style": "Direct but encouraging, uses data to motivate",
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}


def create_test_user_context(user_id: str = "test-user-123", **kwargs: Any) -> Dict[str, Any]:
    """Create a test user context snapshot (Story 6.2 - Context Builder output).

    Args:
        user_id: User ID for this context
        **kwargs: Override default values

    Returns:
        Dict with assembled user context structure
    """
    defaults = {
        "user_id": user_id,
        "assembled_at": datetime.now(timezone.utc).isoformat(),
        "goals": [
            {
                "id": "goal-1",
                "title": "Build consistent workout habit",
                "active_binds": 3,
                "completion_rate": 0.85,
                "current_streak": 7,
            }
        ],
        "recent_activity": {
            "completions_last_7_days": 12,
            "proof_types": ["image", "voice", "note"],
            "most_recent_completion": {
                "bind_title": "Morning workout",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "proof_type": "image",
            },
        },
        "journal": [
            {
                "date": datetime.now(timezone.utc).date().isoformat(),
                "fulfillment_score": 8,
                "entry_preview": "Great day! Completed all morning binds...",
                "ai_feedback_received": True,
            }
        ],
        "identity": {
            "dream_self_name": "Alex the Disciplined",
            "archetype": "Builder",
            "personality_traits": ["supportive", "analytical", "growth-focused"],
            "speaking_style": "Direct but encouraging, uses data to motivate",
        },
        "metrics": {
            "current_streak": 10,
            "longest_streak": 15,
            "overall_completion_rate": 0.78,
            "goals_completed": 2,
            "days_active": 30,
        },
        "recent_wins": [
            "10-day streak achieved",
            "First goal completed: 'Morning routine'",
            "85% consistency on workout bind",
        ],
    }
    return {**defaults, **kwargs}


def create_test_ai_run(user_id: str = "test-user-123", **kwargs: Any) -> Dict[str, Any]:
    """Create a test AI run entry (Story 6.2 - ai_runs with context tracking).

    Args:
        user_id: User ID who triggered this AI run
        **kwargs: Override default values

    Returns:
        Dict with ai_run data
    """
    defaults = {
        "id": "test-ai-run-401",
        "user_id": user_id,
        "module": "ai_chat_contextual",
        "model": "claude-3-7-sonnet-20250219",
        "input_tokens": 1200,
        "output_tokens": 450,
        "cost_usd": 0.0165,
        "context_used": True,  # Story 6.2 new field
        "context_assembly_time_ms": 287,  # Story 6.2 new field
        "quality_flag": "specific",  # Story 6.2 new field: 'generic', 'specific', 'excellent'
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}
