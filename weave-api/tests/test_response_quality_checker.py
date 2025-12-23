"""
Unit Tests for ResponseQualityChecker (Story 6.2)

Tests for detecting generic AI responses and ensuring responses reference user's actual data.

Run: uv run pytest tests/test_response_quality_checker.py -v
"""

from uuid import uuid4

import pytest

from app.services.response_quality_checker import ResponseQualityChecker


# Fixtures for test data
@pytest.fixture
def sample_user_context():
    """Sample user context with goals, completions, and metrics."""
    return {
        "user_id": "test-user-123",
        "goals": [
            {
                "id": str(uuid4()),
                "title": "Build consistent workout habit",
                "active_binds": 3,
                "completion_rate": 0.85,
                "current_streak": 7,
            },
            {
                "id": str(uuid4()),
                "title": "Learn Python testing",
                "active_binds": 2,
                "completion_rate": 0.70,
                "current_streak": 3,
            },
        ],
        "recent_activity": {
            "completions_last_7_days": 12,
            "proof_types": ["image", "voice", "note"],
            "most_recent_completion": {
                "bind_title": "Morning workout",
                "completed_at": "2025-12-22T08:00:00Z",
                "proof_type": "image",
            },
        },
        "metrics": {
            "current_streak": 10,
            "overall_completion_rate": 0.78,
        },
    }


# Unit Tests for ResponseQualityChecker
def test_quality_checker_detects_generic_stay_motivated_phrase(sample_user_context):
    """Test detection of generic 'stay motivated' phrase without specifics.

    GIVEN: AI response with generic 'stay motivated' phrase
    WHEN: is_generic_response() is called
    THEN: Returns True (flagged as generic)
    """
    # GIVEN: Generic response
    generic_response = "You can do it! Stay motivated and keep going every day."

    # WHEN: Checking quality
    checker = ResponseQualityChecker()
    is_generic = checker.is_generic_response(generic_response, sample_user_context)

    # THEN: Flagged as generic
    assert is_generic is True


def test_quality_checker_allows_stay_motivated_with_specifics(sample_user_context):
    """Test that 'stay motivated' is OK if followed by specific data.

    GIVEN: AI response with 'stay motivated' + specific goal mention
    WHEN: is_generic_response() is called
    THEN: Returns False (not generic, has specifics)
    """
    # GIVEN: Response with specifics
    specific_response = "Stay motivated with your 'Build consistent workout habit' goal. Your 7-day streak is impressive!"

    # WHEN: Checking quality
    checker = ResponseQualityChecker()
    is_generic = checker.is_generic_response(specific_response, sample_user_context)

    # THEN: Not flagged as generic
    assert is_generic is False


def test_quality_checker_detects_multiple_generic_phrases(sample_user_context):
    """Test detection when multiple generic phrases are used.

    GIVEN: AI response with multiple generic phrases (keep going, don't give up)
    WHEN: is_generic_response() is called
    THEN: Returns True (flagged as generic)
    """
    # GIVEN: Multiple generic phrases
    generic_response = "Keep going! Don't give up. Believe in yourself. You can do it!"

    # WHEN: Checking quality
    checker = ResponseQualityChecker()
    is_generic = checker.is_generic_response(generic_response, sample_user_context)

    # THEN: Flagged as generic
    assert is_generic is True


def test_quality_checker_detects_goal_name_mention(sample_user_context):
    """Test that response mentioning user's goal name is marked as specific.

    GIVEN: AI response that mentions 'Build consistent workout habit'
    WHEN: mentions_user_data() is called
    THEN: Returns True (response references user data)
    """
    # GIVEN: Response mentioning goal
    specific_response = "Great job on 'Build consistent workout habit'! You're making real progress."

    # WHEN: Checking for data mentions
    checker = ResponseQualityChecker()
    mentions_data = checker.mentions_user_data(specific_response, sample_user_context)

    # THEN: Detects goal mention
    assert mentions_data is True


def test_quality_checker_detects_streak_mention(sample_user_context):
    """Test that response mentioning streak count is marked as specific.

    GIVEN: AI response mentioning 'streak'
    WHEN: mentions_user_data() is called
    THEN: Returns True (references actual data)
    """
    # GIVEN: Response mentioning streak
    specific_response = "Your 10-day streak is fantastic! Keep up the momentum."

    # WHEN: Checking for data mentions
    checker = ResponseQualityChecker()
    mentions_data = checker.mentions_user_data(specific_response, sample_user_context)

    # THEN: Detects streak mention
    assert mentions_data is True


def test_quality_checker_detects_completion_count_mention(sample_user_context):
    """Test that response mentioning completion count is marked as specific.

    GIVEN: AI response mentioning '12 completions' or 'completed 12 times'
    WHEN: mentions_user_data() is called
    THEN: Returns True (references specific metric)
    """
    # GIVEN: Response with completion count
    specific_response = "You completed 12 binds in the last 7 days. That's incredible consistency!"

    # WHEN: Checking for data mentions
    checker = ResponseQualityChecker()
    mentions_data = checker.mentions_user_data(specific_response, sample_user_context)

    # THEN: Detects number + 'day'/'completion' pattern
    assert mentions_data is True


def test_quality_checker_rejects_response_with_no_data_references(sample_user_context):
    """Test that response without any data mentions is marked as generic.

    GIVEN: AI response with no goal names, streaks, or completion counts
    WHEN: mentions_user_data() is called
    THEN: Returns False (no user data referenced)
    """
    # GIVEN: Response without specifics
    generic_response = "You're doing great! Just take it one day at a time and stay focused."

    # WHEN: Checking for data mentions
    checker = ResponseQualityChecker()
    mentions_data = checker.mentions_user_data(generic_response, sample_user_context)

    # THEN: No data mentions found
    assert mentions_data is False


def test_quality_checker_case_insensitive_goal_matching(sample_user_context):
    """Test that goal name matching is case-insensitive.

    GIVEN: AI response with goal name in different case ('WORKOUT HABIT')
    WHEN: mentions_user_data() is called
    THEN: Returns True (matches despite case difference)
    """
    # GIVEN: Response with different case
    specific_response = "Your WORKOUT HABIT goal is showing amazing progress!"

    # WHEN: Checking for data mentions
    checker = ResponseQualityChecker()
    mentions_data = checker.mentions_user_data(specific_response, sample_user_context)

    # THEN: Detects case-insensitive match
    assert mentions_data is True


def test_quality_checker_detects_bind_title_mention(sample_user_context):
    """Test that response mentioning bind title is marked as specific.

    GIVEN: AI response mentioning 'Morning workout' (bind title)
    WHEN: mentions_user_data() is called
    THEN: Returns True (references actual bind)
    """
    # GIVEN: Response mentioning bind title
    specific_response = "You crushed your 'Morning workout' bind today! Well done."

    # WHEN: Checking for data mentions
    checker = ResponseQualityChecker()
    mentions_data = checker.mentions_user_data(specific_response, sample_user_context)

    # THEN: Detects bind title mention
    assert mentions_data is True


def test_quality_checker_handles_empty_context():
    """Test handling when user context is empty (new user).

    GIVEN: User with no goals, no completions (empty context)
    WHEN: is_generic_response() is called with motivational response
    THEN: Returns False (can't require specifics when no data exists)
    """
    # GIVEN: Empty context
    empty_context = {
        "user_id": "new-user",
        "goals": [],
        "recent_activity": {"completions_last_7_days": 0},
        "metrics": {},
    }

    generic_response = "Welcome! Let's get started on your journey."

    # WHEN: Checking quality with empty context
    checker = ResponseQualityChecker()
    is_generic = checker.is_generic_response(generic_response, empty_context)

    # THEN: Not flagged as generic (no data to reference yet)
    assert is_generic is False
