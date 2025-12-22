"""
Pydantic Models for AI Chat API (Story 6.1)

Request/response schemas for AI chat endpoints.
"""

from datetime import datetime
from typing import Optional, List, Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ============================================================
# REQUEST MODELS
# ============================================================

class ChatMessageCreate(BaseModel):
    """Request body for sending a chat message."""
    message: str = Field(..., min_length=1, max_length=500, description="User message content (max 500 chars)")
    conversation_id: Optional[UUID] = Field(None, description="Existing conversation ID (omit to start new conversation)")

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Ensure message is not just whitespace."""
        if not v.strip():
            raise ValueError("Message cannot be empty or whitespace only")
        return v.strip()


class TriggerCheckinRequest(BaseModel):
    """Admin request to manually trigger check-in for a user."""
    user_id: UUID = Field(..., description="User ID to trigger check-in for")


# ============================================================
# RESPONSE MODELS
# ============================================================

class ChatMessage(BaseModel):
    """Individual chat message in a conversation."""
    id: UUID
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: datetime
    tokens_used: Optional[int] = None


class ChatMessageResponse(BaseModel):
    """Response after sending a chat message."""
    message_id: UUID = Field(..., description="ID of user's message")
    response: str = Field(..., description="AI assistant's response")
    response_id: UUID = Field(..., description="ID of assistant's response message")
    conversation_id: UUID = Field(..., description="Conversation thread ID")
    tokens_used: int = Field(..., description="Total tokens used for this interaction")


class ConversationSummary(BaseModel):
    """Summary of a conversation thread."""
    id: UUID
    started_at: datetime
    last_message_at: datetime
    initiated_by: Literal["user", "system"]
    last_message_preview: str = Field(..., description="First 100 chars of last message")


class ConversationDetail(BaseModel):
    """Full conversation thread with all messages."""
    id: UUID
    started_at: datetime
    last_message_at: datetime
    initiated_by: Literal["user", "system"]
    messages: List[ChatMessage]


class UsageStats(BaseModel):
    """User's current AI usage statistics."""
    premium_today: dict = Field(..., description="Premium model usage today: {used: int, limit: int}")
    free_today: dict = Field(..., description="Free model usage today: {used: int, limit: int}")
    monthly: dict = Field(..., description="Monthly total usage: {used: int, limit: int}")
    tier: Literal["free", "pro", "admin"]


# ============================================================
# WRAPPER MODELS (API Response Format)
# ============================================================

class ChatMessageResponseWrapper(BaseModel):
    """Standard API response wrapper for chat message."""
    data: ChatMessageResponse
    meta: dict = Field(default_factory=lambda: {"timestamp": datetime.now().isoformat()})


class ConversationListResponseWrapper(BaseModel):
    """Standard API response wrapper for conversation list."""
    data: List[ConversationSummary]
    meta: dict = Field(
        default_factory=lambda: {
            "timestamp": datetime.now().isoformat(),
            "total": 0
        }
    )


class ConversationDetailResponseWrapper(BaseModel):
    """Standard API response wrapper for conversation detail."""
    data: ConversationDetail
    meta: dict = Field(default_factory=lambda: {"timestamp": datetime.now().isoformat()})


class UsageStatsResponseWrapper(BaseModel):
    """Standard API response wrapper for usage stats."""
    data: UsageStats
    meta: dict = Field(default_factory=lambda: {"timestamp": datetime.now().isoformat()})


# ============================================================
# ERROR MODELS
# ============================================================

class ErrorResponse(BaseModel):
    """Standard error response format."""
    error: dict = Field(..., description="Error details: {code: str, message: str}")
