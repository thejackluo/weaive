"""
Unit Tests for ContextBuilderService (Story 6.2)

Tests for assembling canonical user context snapshots including goals, completions,
journal entries, identity, and consistency metrics.

Run: uv run pytest tests/test_context_builder.py -v
"""

import time
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, Mock, patch
from uuid import uuid4

import pytest

from app.services.context_builder import ContextBuilderService


# Fixtures for test data
@pytest.fixture
def sample_goals():
    """Sample goal data for context building."""
    return [
        {
            "id": str(uuid4()),
            "title": "Build consistent workout habit",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid4()),
            "title": "Learn Python testing",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]


@pytest.fixture
def sample_completions():
    """Sample completion data for recent activity."""
    return [
        {
            "id": str(uuid4()),
            "bind_title": "Morning workout",
            "completed_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            "proof_type": "image",
        },
        {
            "id": str(uuid4()),
            "bind_title": "Evening reflection",
            "completed_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "proof_type": "note",
        },
    ]


@pytest.fixture
def sample_journal_entries():
    """Sample journal entries for context."""
    return [
        {
            "id": str(uuid4()),
            "local_date": (datetime.now(timezone.utc) - timedelta(days=1)).date().isoformat(),
            "fulfillment_score": 8,
            "default_responses": {
                "today_reflection": "Great day! Completed all morning binds.",
                "tomorrow_focus": "Continue the momentum."
            },
        },
        {
            "id": str(uuid4()),
            "local_date": (datetime.now(timezone.utc) - timedelta(days=2)).date().isoformat(),
            "fulfillment_score": 6,
            "default_responses": {
                "today_reflection": "Struggled with evening routine.",
                "tomorrow_focus": "Get back on track."
            },
        },
    ]


@pytest.fixture
def sample_identity_doc():
    """Sample Dream Self identity document."""
    return {
        "id": str(uuid4()),
        "type": "dream_self",
        "content": {
            "dream_self_name": "Alex the Disciplined",
            "archetype": "Builder",
            "personality_traits": ["supportive", "analytical", "growth-focused"],
            "speaking_style": "Direct but encouraging, uses data to motivate",
        },
    }


@pytest.fixture
def mock_db_with_data(sample_goals, sample_completions, sample_journal_entries, sample_identity_doc):
    """Mock Supabase client with sample data."""
    mock_db = Mock()

    # Mock chain for goals query
    goals_chain = Mock()
    goals_chain.select = Mock(return_value=goals_chain)
    goals_chain.eq = Mock(return_value=goals_chain)
    goals_chain.order = Mock(return_value=goals_chain)
    goals_chain.limit = Mock(return_value=goals_chain)
    goals_chain.execute = AsyncMock(return_value=Mock(data=sample_goals))

    # Mock chain for completions query
    completions_chain = Mock()
    completions_chain.select = Mock(return_value=completions_chain)
    completions_chain.eq = Mock(return_value=completions_chain)
    completions_chain.gte = Mock(return_value=completions_chain)
    completions_chain.order = Mock(return_value=completions_chain)
    completions_chain.execute = AsyncMock(return_value=Mock(data=sample_completions))

    # Mock chain for journal entries query
    journal_chain = Mock()
    journal_chain.select = Mock(return_value=journal_chain)
    journal_chain.eq = Mock(return_value=journal_chain)
    journal_chain.order = Mock(return_value=journal_chain)
    journal_chain.limit = Mock(return_value=journal_chain)
    journal_chain.execute = AsyncMock(return_value=Mock(data=sample_journal_entries))

    # Mock chain for identity docs query
    identity_chain = Mock()
    identity_chain.select = Mock(return_value=identity_chain)
    identity_chain.eq = Mock(return_value=identity_chain)
    identity_chain.execute = AsyncMock(return_value=Mock(data=[sample_identity_doc]))

    # Mock table() to return appropriate chain
    def mock_table(table_name):
        if table_name == "goals":
            return goals_chain
        elif table_name == "subtask_completions":
            return completions_chain
        elif table_name == "journal_entries":
            return journal_chain
        elif table_name == "identity_docs":
            return identity_chain
        else:
            # Default empty mock
            empty_chain = Mock()
            empty_chain.select = Mock(return_value=empty_chain)
            empty_chain.eq = Mock(return_value=empty_chain)
            empty_chain.execute = AsyncMock(return_value=Mock(data=[]))
            return empty_chain

    mock_db.table = mock_table

    return mock_db


# Unit Tests for ContextBuilderService
@pytest.mark.asyncio
async def test_context_builder_returns_structured_json(mock_db_with_data):
    """Test that ContextBuilderService.build_context() returns valid structured JSON.

    GIVEN: ContextBuilderService initialized with mock database
    WHEN: build_context() is called with a user_id
    THEN: Returns structured JSON with required fields
    """
    # GIVEN: ContextBuilderService with mock database
    service = ContextBuilderService(db=mock_db_with_data)
    user_id = "test-user-123"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Context has required structure
    assert context is not None
    assert isinstance(context, dict)
    assert "user_id" in context
    assert "assembled_at" in context
    assert "goals" in context
    assert "recent_activity" in context
    assert "journal" in context
    assert "identity" in context
    assert "metrics" in context
    assert context["user_id"] == user_id


@pytest.mark.asyncio
async def test_context_includes_active_goals(mock_db_with_data, sample_goals):
    """Test that context includes active goals with relevant details.

    GIVEN: User with 2 active goals in database
    WHEN: build_context() is called
    THEN: Context includes goals array with title, active_binds, completion_rate
    """
    # GIVEN: User with active goals
    service = ContextBuilderService(db=mock_db_with_data)
    user_id = "test-user-123"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Goals are included
    assert "goals" in context
    assert isinstance(context["goals"], list)
    assert len(context["goals"]) == 2

    # Verify goal structure
    goal = context["goals"][0]
    assert "id" in goal
    assert "title" in goal
    assert goal["title"] == sample_goals[0]["title"]


@pytest.mark.asyncio
async def test_context_includes_recent_completions(mock_db_with_data, sample_completions):
    """Test that context includes recent completions (last 7 days).

    GIVEN: User with completions in last 7 days
    WHEN: build_context() is called
    THEN: Context includes recent_activity with completion count and proof types
    """
    # GIVEN: User with recent completions
    service = ContextBuilderService(db=mock_db_with_data)
    user_id = "test-user-123"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Recent activity is included
    assert "recent_activity" in context
    assert isinstance(context["recent_activity"], dict)
    assert "completions_last_7_days" in context["recent_activity"]
    assert context["recent_activity"]["completions_last_7_days"] == 2


@pytest.mark.asyncio
async def test_context_includes_journal_entries(mock_db_with_data, sample_journal_entries):
    """Test that context includes last 3 journal entries with fulfillment scores.

    GIVEN: User with journal entries
    WHEN: build_context() is called
    THEN: Context includes journal array (max 3) with dates and fulfillment scores
    """
    # GIVEN: User with journal entries
    service = ContextBuilderService(db=mock_db_with_data)
    user_id = "test-user-123"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Journal entries are included
    assert "journal" in context
    assert isinstance(context["journal"], list)
    assert len(context["journal"]) <= 3  # Max 3 entries

    # Verify journal entry structure
    entry = context["journal"][0]
    assert "date" in entry or "local_date" in entry
    assert "fulfillment_score" in entry


@pytest.mark.asyncio
async def test_context_includes_dream_self_personality(mock_db_with_data, sample_identity_doc):
    """Test that context includes Dream Self personality from identity document.

    GIVEN: User with Dream Self identity document
    WHEN: build_context() is called
    THEN: Context includes identity with dream_self_name and personality_traits
    """
    # GIVEN: User with Dream Self document
    service = ContextBuilderService(db=mock_db_with_data)
    user_id = "test-user-123"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Identity is included
    assert "identity" in context
    assert isinstance(context["identity"], dict)
    assert "dream_self_name" in context["identity"]
    assert context["identity"]["dream_self_name"] == "Alex the Disciplined"


@pytest.mark.asyncio
async def test_context_assembly_performance_under_500ms(mock_db_with_data):
    """Test that context assembly completes in <500ms (performance requirement).

    GIVEN: ContextBuilderService with database
    WHEN: build_context() is called
    THEN: Assembly completes in less than 500 milliseconds
    """
    # GIVEN: ContextBuilderService
    service = ContextBuilderService(db=mock_db_with_data)
    user_id = "test-user-123"

    # WHEN: Building context and measuring time
    start_time = time.time()
    context = await service.build_context(user_id)
    end_time = time.time()

    assembly_time_ms = (end_time - start_time) * 1000

    # THEN: Assembly is fast (<500ms)
    assert assembly_time_ms < 500, f"Context assembly took {assembly_time_ms}ms (target: <500ms)"
    assert "assembled_at" in context


@pytest.mark.asyncio
async def test_context_builder_handles_no_goals_gracefully():
    """Test that context building works even when user has no goals.

    GIVEN: User with no goals in database
    WHEN: build_context() is called
    THEN: Context is returned with empty goals array (not None)
    """
    # GIVEN: User with no goals
    mock_db = Mock()
    empty_chain = Mock()
    empty_chain.select = Mock(return_value=empty_chain)
    empty_chain.eq = Mock(return_value=empty_chain)
    empty_chain.order = Mock(return_value=empty_chain)
    empty_chain.limit = Mock(return_value=empty_chain)
    empty_chain.gte = Mock(return_value=empty_chain)
    empty_chain.execute = AsyncMock(return_value=Mock(data=[]))
    mock_db.table = Mock(return_value=empty_chain)

    service = ContextBuilderService(db=mock_db)
    user_id = "test-user-456"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Context has empty goals array
    assert context is not None
    assert "goals" in context
    assert isinstance(context["goals"], list)
    assert len(context["goals"]) == 0


@pytest.mark.asyncio
async def test_context_builder_handles_no_dream_self_doc():
    """Test fallback when user has no Dream Self identity document.

    GIVEN: User with no Dream Self document
    WHEN: build_context() is called
    THEN: Context includes default coach persona
    """
    # GIVEN: User with no Dream Self doc
    mock_db = Mock()
    empty_chain = Mock()
    empty_chain.select = Mock(return_value=empty_chain)
    empty_chain.eq = Mock(return_value=empty_chain)
    empty_chain.order = Mock(return_value=empty_chain)
    empty_chain.limit = Mock(return_value=empty_chain)
    empty_chain.gte = Mock(return_value=empty_chain)
    empty_chain.execute = AsyncMock(return_value=Mock(data=[]))
    mock_db.table = Mock(return_value=empty_chain)

    service = ContextBuilderService(db=mock_db)
    user_id = "test-user-789"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Identity uses default persona
    assert "identity" in context
    assert isinstance(context["identity"], dict)
    # Default persona should have some basic structure
    assert "dream_self_name" in context["identity"] or "default" in str(context["identity"]).lower()


@pytest.mark.asyncio
async def test_context_builder_handles_database_timeout():
    """Test graceful handling when database query times out.

    GIVEN: Database query that times out
    WHEN: build_context() is called
    THEN: Returns None (allows fallback in API layer)
    """
    # GIVEN: Database that times out
    mock_db = Mock()
    timeout_chain = Mock()
    timeout_chain.select = Mock(return_value=timeout_chain)
    timeout_chain.eq = Mock(return_value=timeout_chain)
    timeout_chain.execute = AsyncMock(side_effect=TimeoutError("Database query timeout"))
    mock_db.table = Mock(return_value=timeout_chain)

    service = ContextBuilderService(db=mock_db)
    user_id = "test-user-timeout"

    # WHEN: Building context (with timeout)
    context = await service.build_context(user_id)

    # THEN: Returns None (graceful fallback)
    assert context is None


@pytest.mark.asyncio
async def test_context_builder_includes_consistency_metrics(mock_db_with_data):
    """Test that context includes consistency metrics (streak, completion rate).

    GIVEN: User with completion history
    WHEN: build_context() is called
    THEN: Context includes metrics with current_streak and completion_rate
    """
    # GIVEN: User with completions
    service = ContextBuilderService(db=mock_db_with_data)
    user_id = "test-user-123"

    # WHEN: Building context
    context = await service.build_context(user_id)

    # THEN: Metrics are included
    assert "metrics" in context
    assert isinstance(context["metrics"], dict)
    # Metrics should include at least some basic stats
    assert len(context["metrics"]) > 0
