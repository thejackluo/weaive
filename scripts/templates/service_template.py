"""
Service Layer Template for Weave Backend
Story 1.5.2: Backend API/Model Standardization

⚠️ IMPORTANT: Most endpoints should NOT use services - prefer inline logic in routers.
Only create service classes when logic meets the criteria below.

============================================================================
SERVICE LAYER DECISION TREE
============================================================================

USE INLINE LOGIC IN ROUTER (DEFAULT):
✅ Simple CRUD operations (get, list, create, update, delete)
✅ Single database table operations
✅ <20 lines of business logic
✅ No complex validation beyond Pydantic schemas
✅ No multi-step workflows

Example: Get user profile, list goals, create journal entry

CREATE SERVICE CLASS WHEN:
⚠️ Complex business logic (>20 lines)
⚠️ Multi-table transactions (multiple database operations that must succeed/fail together)
⚠️ Reusable logic across multiple endpoints
⚠️ AI integrations (requires context building, prompt engineering)
⚠️ External API calls (third-party services)
⚠️ Complex validation requiring database queries

Example: Goal breakdown with AI, triad generation, onboarding flow

============================================================================
QUICK CHECKLIST
============================================================================

Before creating a service, ask:
1. Is this logic >20 lines? → If NO, use inline
2. Does it span multiple tables? → If NO, use inline
3. Will multiple endpoints use this? → If NO, use inline
4. Does it call AI or external APIs? → If NO, use inline

If you answered YES to 2+ questions, create a service.
Otherwise, keep logic inline in the router.

============================================================================
SERVICE TEMPLATE (Use only when appropriate)
============================================================================
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

# Supabase client
from supabase import create_client, Client
from app.core.config import settings

# Pydantic models
# from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}Response

# Error handling
# from app.core.errors import AppException

logger = logging.getLogger(__name__)


class {Resource}Service:
    """
    Service class for {resource} complex business logic

    Epic X, Story X.X: [Story Name]

    ⚠️ ONLY use this service when logic is complex enough to warrant it.
    For simple CRUD, use inline logic in the router instead.

    This service handles:
    - [Describe complex operation 1]
    - [Describe complex operation 2]
    - [Describe why this needs a service]
    """

    def __init__(self, supabase_client: Client):
        """
        Initialize service with Supabase client

        Args:
            supabase_client: Authenticated Supabase client
        """
        self.supabase = supabase_client

    # ========================================================================
    # COMPLEX BUSINESS LOGIC METHODS
    # ========================================================================

    async def perform_complex_operation(
        self,
        user_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Perform complex multi-step operation

        This method is appropriate for a service because:
        - It involves multiple database tables
        - It has complex business logic
        - It requires transaction-like behavior

        Args:
            user_id: User ID from JWT token
            data: Operation data

        Returns:
            Result dictionary

        Raises:
            AppException: If operation fails
        """
        try:
            # Step 1: Validate business rules
            await self._validate_business_rules(user_id, data)

            # Step 2: Perform main operation
            result = await self._execute_main_operation(user_id, data)

            # Step 3: Update related records
            await self._update_related_records(user_id, result)

            # Step 4: Log activity
            await self._log_activity(user_id, "complex_operation", result)

            logger.info(f"Complex operation completed for user {user_id}")
            return result

        except Exception as e:
            logger.error(f"Complex operation failed for user {user_id}: {e}")
            # Rollback handled by Supabase transaction (if using)
            raise

    # ========================================================================
    # PRIVATE HELPER METHODS
    # ========================================================================

    async def _validate_business_rules(
        self,
        user_id: str,
        data: Dict[str, Any]
    ) -> None:
        """
        Validate complex business rules

        Example: Check user hasn't exceeded limits, validate dependencies
        """
        # Example: Check active goal limit
        response = self.supabase.table('goals').select(
            'id',
            count='exact'
        ).eq('user_id', user_id).eq('status', 'active').is_('deleted_at', 'null').execute()

        if response.count >= 3:
            raise Exception("Maximum 3 active goals allowed")

    async def _execute_main_operation(
        self,
        user_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute main operation logic
        """
        # Implementation here
        pass

    async def _update_related_records(
        self,
        user_id: str,
        result: Dict[str, Any]
    ) -> None:
        """
        Update related records after main operation
        """
        # Implementation here
        pass

    async def _log_activity(
        self,
        user_id: str,
        action: str,
        details: Dict[str, Any]
    ) -> None:
        """
        Log user activity for audit trail
        """
        self.supabase.table('activity_log').insert({
            'user_id': user_id,
            'action': action,
            'details': details,
            'timestamp': datetime.utcnow().isoformat()
        }).execute()


# ============================================================================
# EXAMPLE: AI-POWERED SERVICE (Good use case for services)
# ============================================================================

class GoalBreakdownService:
    """
    Service for breaking down goals into subtasks using AI

    This is a GOOD example of when to use a service:
    - Complex multi-step workflow
    - AI integration
    - Multiple database operations
    - Reusable across endpoints
    """

    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def generate_goal_breakdown(
        self,
        user_id: str,
        goal_id: str,
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered goal breakdown

        Steps:
        1. Load goal and user context
        2. Build AI prompt with context
        3. Call AI service
        4. Parse AI response
        5. Create subtask templates in database
        6. Return breakdown structure
        """
        try:
            # Step 1: Load goal
            goal = await self._get_goal(goal_id, user_id)

            # Step 2: Build context
            context = await self._build_ai_context(user_id, goal, user_context)

            # Step 3: Call AI
            ai_response = await self._call_ai_service(context)

            # Step 4: Parse response
            breakdown = self._parse_ai_breakdown(ai_response)

            # Step 5: Save subtasks
            subtasks = await self._create_subtasks(goal_id, breakdown)

            # Step 6: Return result
            return {
                'goal_id': goal_id,
                'subtasks': subtasks,
                'breakdown_strategy': breakdown['strategy']
            }

        except Exception as e:
            logger.error(f"Goal breakdown failed: {e}")
            raise

    async def _get_goal(self, goal_id: str, user_id: str) -> Dict[str, Any]:
        """Load goal with ownership check"""
        response = self.supabase.table('goals').select('*').eq(
            'id', goal_id
        ).eq('user_id', user_id).single().execute()
        return response.data

    async def _build_ai_context(
        self,
        user_id: str,
        goal: Dict[str, Any],
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build comprehensive context for AI"""
        # Load user profile, identity docs, previous goals
        # Return structured context
        pass

    async def _call_ai_service(self, context: Dict[str, Any]) -> str:
        """Call AI service with prompt"""
        # Use AIService from app.services.ai
        pass

    def _parse_ai_breakdown(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into structured breakdown"""
        # Extract subtasks, strategy, timeline
        pass

    async def _create_subtasks(
        self,
        goal_id: str,
        breakdown: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Create subtask templates in database"""
        # Bulk insert subtasks
        pass


# ============================================================================
# EXAMPLE: INLINE LOGIC (Preferred for simple operations)
# ============================================================================

"""
GOOD: Inline logic in router (no service needed)

@router.get("/api/goals", response_model=dict)
async def list_goals(
    user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    '''List user's goals (simple query - no service needed)'''
    auth_user_id = user["sub"]

    # Simple database query - no need for service
    response = supabase.table('goals').select(
        '*'
    ).eq('user_id', auth_user_id).is_('deleted_at', 'null').range(
        (page - 1) * per_page,
        page * per_page - 1
    ).execute()

    return {
        "data": response.data,
        "meta": {
            "total": len(response.data),
            "page": page,
            "per_page": per_page,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }


@router.post("/api/goals", status_code=201, response_model=dict)
async def create_goal(
    data: GoalCreate,
    user: dict = Depends(get_current_user)
):
    '''Create goal (simple insert - no service needed)'''
    auth_user_id = user["sub"]

    # Simple validation + insert - no need for service
    # Check goal limit
    count_response = supabase.table('goals').select(
        'id',
        count='exact'
    ).eq('user_id', auth_user_id).eq('status', 'active').is_('deleted_at', 'null').execute()

    if count_response.count >= 3:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "GOAL_LIMIT_EXCEEDED",
                "message": "Maximum 3 active goals allowed"
            }
        )

    # Create goal
    insert_response = supabase.table('goals').insert({
        'user_id': auth_user_id,
        **data.model_dump()
    }).execute()

    return {
        "data": insert_response.data[0],
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
"""


# ============================================================================
# BAD: Over-engineered service for simple operation
# ============================================================================

"""
❌ BAD: Don't create a service for this

class GoalCRUDService:
    '''Unnecessary service for simple CRUD operations'''

    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def get_goal(self, goal_id: str, user_id: str):
        '''Just a wrapper around database query - use inline instead'''
        return self.supabase.table('goals').select('*').eq(
            'id', goal_id
        ).eq('user_id', user_id).single().execute()

    async def list_goals(self, user_id: str):
        '''Just a wrapper around database query - use inline instead'''
        return self.supabase.table('goals').select('*').eq(
            'user_id', user_id
        ).execute()

    # ❌ This is premature abstraction
    # ❌ No complex logic to justify a service
    # ❌ Just adds boilerplate and indirection
    # ✅ Use inline logic in router instead
"""


# ============================================================================
# DECISION FLOWCHART
# ============================================================================

"""
Is this endpoint doing complex work?
│
├─ NO → Use inline logic in router ✅
│
└─ YES → Ask: Is it >20 lines?
    │
    ├─ NO → Use inline logic in router ✅
    │
    └─ YES → Ask: Multiple tables or AI involved?
        │
        ├─ NO → Try to simplify, then inline ✅
        │
        └─ YES → Ask: Will other endpoints use this?
            │
            ├─ NO → Consider inline first ✅
            │
            └─ YES → Create service class ✅

REMEMBER: Services are for COMPLEX operations, not all operations.
Default to inline logic. Only create services when complexity demands it.
"""


# ============================================================================
# SERVICE USAGE IN ROUTER
# ============================================================================

"""
from fastapi import APIRouter, Depends
from app.services.{resource} import {Resource}Service
from app.core.auth import get_current_user
from app.core.database import get_supabase_client

router = APIRouter(prefix="/api/{resources}", tags=["{resources}"])

@router.post("/api/goals/breakdown", status_code=201, response_model=dict)
async def generate_goal_breakdown(
    goal_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    '''Complex operation - uses service'''
    auth_user_id = user["sub"]

    # Initialize service
    service = GoalBreakdownService(supabase)

    # Call service method
    result = await service.generate_goal_breakdown(
        user_id=auth_user_id,
        goal_id=goal_id,
        user_context={}
    )

    return {
        "data": result,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
"""
