"""
AI Chat API Router (Story 6.1 + 6.2 UNIFIED)

Endpoints for AI chat interface with contextual AI responses and dual personality system.

Endpoints:
- POST /api/ai-chat/messages - Send message, get AI response (with context + tools)
- POST /api/ai-chat/messages/stream - Send message, get streaming AI response (SSE)
- GET /api/ai-chat/conversations - List user's conversation history
- GET /api/ai-chat/conversations/{conversation_id} - Get full conversation thread
- GET /api/ai/usage - Get user's AI usage statistics
- POST /api/admin/trigger-checkin/{user_id} - Manually trigger check-in (admin only)

Personality System (Unified Story 6.1 + 6.2):
- Dream Self: Personalized AI from identity_docs (user's ideal self)
- Weave AI: General coach with Story 6.1 presets (gen_z_default, supportive_coach, concise_mentor)
"""

import json
import logging
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from supabase import Client as SupabaseClient

from app.config.ai_chat_config import AIChatConfig
from app.core.deps import get_current_user, get_supabase_client
from app.models.ai_chat_models import (
    ChatMessage,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatMessageResponseWrapper,
    ConversationDetail,
    ConversationDetailResponseWrapper,
    ConversationListResponseWrapper,
    ConversationSummary,
    UsageStats,
    UsageStatsResponseWrapper,
)
from app.services.ai import AIService
from app.services.ai.tiered_rate_limiter import TieredRateLimiter
from app.services.context_builder import ContextBuilderService  # Story 6.2
from app.services.personality_service import PersonalityService  # Story 6.2
from app.services.ai_orchestrator import AIOrchestrator  # Story 6.2
from app.services.tools import get_tool_registry  # Story 6.2
from app.services.tools.ai_tool_classifier import create_tool_classifier  # Story 6.2 - AI-based classification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["ai-chat"])


# ============================================================
# DEPENDENCY INJECTION
# ============================================================

def get_tiered_rate_limiter(db: SupabaseClient = Depends(get_supabase_client)) -> TieredRateLimiter:
    """Get tiered rate limiter instance."""
    return TieredRateLimiter(db)


def get_ai_service(db: SupabaseClient = Depends(get_supabase_client)) -> AIService:
    """Get AI service instance."""
    return AIService(db)


def check_admin_key(x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")) -> bool:
    """Check if request has valid admin key for bypass."""
    logger.info(f"[ADMIN_KEY_CHECK] Received header: {x_admin_key}")
    logger.info(f"[ADMIN_KEY_CHECK] Expected key: {AIChatConfig.ADMIN_API_KEY}")
    if not AIChatConfig.ADMIN_API_KEY:
        logger.warning("[ADMIN_KEY_CHECK] AI_ADMIN_KEY not set in .env!")
        return False
    is_valid = x_admin_key == AIChatConfig.ADMIN_API_KEY
    logger.info(f"[ADMIN_KEY_CHECK] Valid: {is_valid}")
    return is_valid


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_user_id_from_auth(db: SupabaseClient, auth_user_id: str) -> Optional[UUID]:
    """
    Get user_profiles.id from auth.uid.

    Args:
        db: Supabase client
        auth_user_id: auth.uid (from JWT)

    Returns:
        user_profiles.id or None if not found
    """
    try:
        result = db.table('user_profiles') \
            .select('id') \
            .eq('auth_user_id', auth_user_id) \
            .single() \
            .execute()

        if result.data:
            return UUID(result.data['id'])
        return None

    except Exception as e:
        logger.error(f"Error getting user_id from auth_user_id {auth_user_id}: {e}")
        return None


def create_conversation(
    db: SupabaseClient,
    user_id: UUID,
    initiated_by: str = "user"
) -> UUID:
    """
    Create a new conversation thread.

    Args:
        db: Supabase client
        user_id: user_profiles.id
        initiated_by: "user" or "system"

    Returns:
        Conversation ID
    """
    try:
        result = db.table('ai_chat_conversations').insert({
            'user_id': str(user_id),
            'initiated_by': initiated_by,
            'started_at': datetime.now(timezone.utc).isoformat(),
            'last_message_at': datetime.now(timezone.utc).isoformat()
        }).execute()

        return UUID(result.data[0]['id'])

    except Exception as e:
        logger.error(f"Error creating conversation for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail={
            "code": "CONVERSATION_CREATE_ERROR",
            "message": "Failed to create conversation thread"
        })


def save_message(
    db: SupabaseClient,
    conversation_id: UUID,
    role: str,
    content: str,
    tokens_used: Optional[int] = None
) -> UUID:
    """
    Save a message to the database.

    Args:
        db: Supabase client
        conversation_id: Conversation thread ID
        role: "user", "assistant", or "system"
        content: Message content
        tokens_used: Tokens used (for cost tracking)

    Returns:
        Message ID
    """
    try:
        # Enhanced logging for debugging conversation history
        logger.info(f"[SAVE_MESSAGE] 💾 Saving {role} message to conv {conversation_id}: {content[:50]}...")

        result = db.table('ai_chat_messages').insert({
            'conversation_id': str(conversation_id),
            'role': role,
            'content': content,
            'tokens_used': tokens_used,
            'created_at': datetime.now(timezone.utc).isoformat()
        }).execute()

        message_id = UUID(result.data[0]['id'])
        logger.info(f"[SAVE_MESSAGE] ✅ Saved {role} message: {message_id}")

        # Update conversation last_message_at
        db.table('ai_chat_conversations').update({
            'last_message_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', str(conversation_id)).execute()

        return message_id

    except Exception as e:
        logger.error(f"[SAVE_MESSAGE] ❌ Error saving {role} message to conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail={
            "code": "MESSAGE_SAVE_ERROR",
            "message": "Failed to save message"
        })


# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/ai-chat/messages", response_model=ChatMessageResponseWrapper)
async def send_chat_message(
    request: ChatMessageCreate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client),
    rate_limiter: TieredRateLimiter = Depends(get_tiered_rate_limiter),
    ai_service: AIService = Depends(get_ai_service),
    is_admin: bool = Depends(check_admin_key)
):
    """
    Send a chat message and get AI response.

    **Flow:**
    1. Check rate limits (tiered: 10 premium + 40 free per day, 500/month)
    2. Create conversation if needed
    3. Save user message
    4. Call AIService for response (uses existing fallback chain)
    5. Save assistant response
    6. Increment usage counters
    7. Return response

    **Rate Limiting:**
    - FREE tier: 10 premium + 40 free messages/day, 500/month
    - PRO tier: 2,500-5,000 messages/month
    - ADMIN: Unlimited (with X-Admin-Key header)

    **Model Selection:**
    - Default: Claude Sonnet 3.7 (premium)
    - Fallback: Haiku → GPT-4o-mini → Deterministic
    """
    # Extract auth.uid from JWT token (Story 0.3)
    auth_user_id = user["sub"]

    # Get user_profiles.id from auth.uid
    user_id = get_user_id_from_auth(db, auth_user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail={
            "code": "USER_NOT_FOUND",
            "message": "User profile not found"
        })

    # Get user's subscription tier
    try:
        user_result = db.table('user_profiles').select('subscription_tier').eq('id', str(user_id)).single().execute()
        subscription_tier = user_result.data.get('subscription_tier', 'free') if user_result.data else 'free'
    except Exception as e:
        logger.warning(f"Error getting subscription tier for user {user_id}: {e}")
        subscription_tier = 'free'

    # Model selection with fallback chain
    # ✅ Fixed: Use actual AWS Bedrock model IDs from documentation
    models_to_try = [
        'claude-3-5-haiku-20241022',       # Claude 3.5 Haiku (exists in Bedrock)
        'claude-3-haiku-20240307',         # Claude 3 Haiku (exists in Bedrock)
        'gpt-4o-mini',                     # OpenAI fallback
        'gpt-3.5-turbo'                    # Final OpenAI fallback
    ]
    model = models_to_try[0]  # Default to best available model

    # Check rate limit BEFORE processing
    rate_limiter.check_rate_limit(
        user_id=str(user_id),
        model=model,
        subscription_tier=subscription_tier,
        bypass_admin_key=is_admin
    )

    # Create or get conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation_id = create_conversation(db, user_id, initiated_by="user")

    # Save user message
    user_message_id = save_message(
        db=db,
        conversation_id=conversation_id,
        role="user",
        content=request.message
    )

    # Story 6.2: Build user context if requested
    user_context = None
    context_used = False
    if request.include_context:
        try:
            context_builder = ContextBuilderService(db)
            user_context = await context_builder.build_context(str(user_id))
            context_used = user_context is not None
            if context_used:
                logger.info(f"✅ [CONTEXT] Built context for user {user_id}")
            else:
                logger.warning(f"⚠️  [CONTEXT] Context assembly timed out for user {user_id}")
        except Exception as e:
            logger.error(f"❌ [CONTEXT] Error building context for user {user_id}: {e}")
            context_used = False

    # Story 6.2: Get active personality (UNIFIED with Story 6.1 presets)
    personality_details = None
    personality_type = "weave_ai"  # Default
    system_prompt = "You are Weave, a supportive AI coach."  # Fallback

    try:
        personality_service = PersonalityService(db)
        personality_details = await personality_service.get_active_personality(str(user_id))
        personality_type = personality_details.get('personality_type', 'weave_ai')
        system_prompt = personality_details.get('system_prompt', system_prompt)

        if personality_type == "weave_ai":
            preset = personality_details.get('preset', 'gen_z_default')
            logger.info(f"✅ [PERSONALITY] User {user_id} using Weave AI (preset: {preset})")
        else:
            name = personality_details.get('name', 'Dream Self')
            logger.info(f"✅ [PERSONALITY] User {user_id} using Dream Self: {name}")
    except Exception as e:
        logger.warning(f"⚠️  [PERSONALITY] Error getting personality for user {user_id}: {e}")

    # Build full prompt with user message
    full_prompt = f"{system_prompt}\n\nUser: {request.message}"

    # Call AI service with model fallback chain
    ai_response = None
    response_text = None
    tokens_used = 0
    tools_invoked = []

    # Story 6.2: AI-based tool classification
    if request.enable_tools:
        try:
            logger.info(f"🔧 [TOOLS] Tool calling enabled - analyzing message with AI classifier")

            # Step 1: Analyze message for tool triggers (AI-based classification)
            tool_classifier = create_tool_classifier(ai_service)
            # ✅ FIX: analyze_message is NOT async - don't use await
            triggered_tools = tool_classifier.analyze_message(request.message, str(user_id))

            logger.info(f"🎯 [TOOLS] AI identified {len(triggered_tools)} tool(s)")

            # Step 2: Execute triggered tools immediately
            tool_registry = get_tool_registry()
            tool_execution_results = []

            for tool_call in triggered_tools:
                tool_name = tool_call['tool_name']
                parameters = tool_call['parameters']
                logger.info(f"🔄 [TOOLS] Executing tool: {tool_name} with params: {parameters}")

                # Execute tool
                result = await tool_registry.execute_tool(tool_name, str(user_id), parameters)

                tool_execution_results.append({
                    'tool_name': tool_name,
                    'input': parameters,
                    'success': result.get('success', False),
                    'result': result.get('data'),
                    'error': result.get('error')
                })

                if result.get('success'):
                    logger.info(f"✅ [TOOLS] Tool {tool_name} succeeded")
                else:
                    logger.error(f"❌ [TOOLS] Tool {tool_name} failed: {result.get('error')}")

            tools_invoked = tool_execution_results
            logger.info(f"✅ [TOOLS] Executed {len(tools_invoked)} tool(s)")

            # Step 3: Build enhanced prompt with tool results
            if tool_execution_results:
                tool_results_summary = "\n\n".join([
                    f"Tool '{t['tool_name']}' executed:\n"
                    f"- Input: {t['input']}\n"
                    f"- Result: {t['result'] if t['success'] else 'ERROR: ' + str(t.get('error', 'Unknown error'))}"
                    for t in tool_execution_results
                ])
                full_prompt = f"{full_prompt}\n\n[System: The following tools were executed:\n{tool_results_summary}\n\nPlease incorporate these results into your response naturally.]"

        except Exception as e:
            logger.error(f"❌ [TOOLS] Tool execution failed: {e}")
            # Continue with regular generation (don't disable tools, just skip execution)
            tools_invoked = []

    # Generate AI response (with or without tool results in prompt)
    # Try each model in sequence
    for i, model_to_try in enumerate(models_to_try):
        try:
            logger.info(f"🔄 [MODEL_FALLBACK] Trying model {i+1}/{len(models_to_try)}: {model_to_try}")

            # Call existing AIService
            ai_response = ai_service.generate(
                user_id=str(user_id),
                user_role='admin' if is_admin else 'user',
                user_tier=subscription_tier,
                module='chat',
                prompt=full_prompt,
                model=model_to_try,
                max_tokens=500,
                user_context=user_context  # Story 6.2: Pass context
            )

            response_text = ai_response.get('content', 'Sorry, I encountered an issue. Please try again.')
            tokens_used = ai_response.get('total_tokens', 0)

            logger.info(f"✅ [MODEL_FALLBACK] Success with model: {model_to_try}")
            model = model_to_try  # Update model for usage tracking
            break  # Success! Exit the loop

        except Exception as e:
            logger.warning(f"⚠️  [MODEL_FALLBACK] Model {model_to_try} failed: {e}")
            if i == len(models_to_try) - 1:  # Last model failed
                logger.error(f"💥 [MODEL_FALLBACK] All models failed for user {user_id}")
                # Fallback response (deterministic)
                response_text = "I'm having trouble responding right now. Please try again in a moment."
                tokens_used = 0
            # Continue to next model

    # Save assistant response
    assistant_message_id = save_message(
        db=db,
        conversation_id=conversation_id,
        role="assistant",
        content=response_text,
        tokens_used=tokens_used
    )

    # Increment usage counters (after successful response)
    rate_limiter.increment_usage(
        user_id=str(user_id),
        model=model,
        bypass_admin_key=is_admin
    )

    # Return response with Story 6.2 metadata
    return ChatMessageResponseWrapper(
        data=ChatMessageResponse(
            message_id=user_message_id,
            response=response_text,
            response_id=assistant_message_id,
            conversation_id=conversation_id,
            tokens_used=tokens_used,
            context_used=context_used,  # Story 6.2
            personality_type=personality_type,  # Story 6.2
            tools_invoked=tools_invoked  # Story 6.2
        )
    )


@router.post("/ai-chat/messages/stream")
async def send_chat_message_stream(
    request: ChatMessageCreate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client),
    rate_limiter: TieredRateLimiter = Depends(get_tiered_rate_limiter),
    ai_service: AIService = Depends(get_ai_service),
    is_admin: bool = Depends(check_admin_key)
):
    """
    Send a chat message and get streaming AI response (SSE).

    **SSE Event Format:**
    - `data: {"type": "chunk", "content": "word or sentence"}\n\n` - During generation
    - `data: {"type": "metadata", "message_id": "uuid", "conversation_id": "uuid"}\n\n` - User message saved
    - `data: {"type": "done", "response_id": "uuid", "tokens_used": N, "cost_usd": X}\n\n` - Final metadata

    **Flow:**
    1. Check rate limits (tiered: 10 premium + 40 free per day, 500/month)
    2. Create conversation if needed
    3. Save user message
    4. Stream AI response chunks in real-time
    5. Save complete assistant response
    6. Increment usage counters
    7. Send final metadata

    **Benefits:**
    - Real-time typing effect (perceived latency <500ms for first words vs ~3s for full response)
    - Better UX for long responses
    - No blocking wait for complete generation
    """

    # Log admin status at endpoint level
    logger.info(f"[STREAMING_ENDPOINT] is_admin dependency resolved: {is_admin}")

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events."""
        try:
            # Extract auth.uid from JWT token (Story 0.3) - passed from outer scope
            auth_user_id = user["sub"]

            # Get user_profiles.id from auth.uid
            user_id = get_user_id_from_auth(db, auth_user_id)
            if not user_id:
                error_event = json.dumps({
                    "type": "error",
                    "code": "USER_NOT_FOUND",
                    "message": "User profile not found"
                })
                yield f"data: {error_event}\n\n"
                return

            # Get user's subscription tier
            try:
                user_result = db.table('user_profiles').select('subscription_tier').eq('id', str(user_id)).single().execute()
                subscription_tier = user_result.data.get('subscription_tier', 'free') if user_result.data else 'free'
            except Exception as e:
                logger.warning(f"Error getting subscription tier for user {user_id}: {e}")
                subscription_tier = 'free'

            # Model selection with fallback chain
            # ✅ Fixed: Use actual AWS Bedrock model IDs from documentation
            models_to_try = [
                'claude-3-5-haiku-20241022',       # Claude 3.5 Haiku (exists in Bedrock)
                'claude-3-haiku-20240307',         # Claude 3 Haiku (exists in Bedrock)
                'gpt-4o-mini',                     # OpenAI fallback
                'gpt-3.5-turbo'                    # Final OpenAI fallback
            ]
            model = models_to_try[0]  # Default to best available model

            # Check rate limit BEFORE processing
            logger.info(f"[STREAMING] Calling rate limiter with: user_id={user_id}, model={model}, tier={subscription_tier}, is_admin={is_admin}")
            try:
                rate_limiter.check_rate_limit(
                    user_id=str(user_id),
                    model=model,
                    subscription_tier=subscription_tier,
                    bypass_admin_key=is_admin
                )
            except HTTPException as e:
                # ✅ FIX: Stream error message character by character for better UX
                error_msg = e.detail.get("message", "Rate limit exceeded")

                # Send metadata first
                metadata_event = json.dumps({"type": "metadata", "message_id": None, "conversation_id": None})
                yield f"data: {metadata_event}\n\n"

                # Stream error message as chunks (fake stream for UX)
                import asyncio
                for i in range(0, len(error_msg), 10):  # 10 chars at a time
                    chunk = error_msg[i:i+10]
                    chunk_event = json.dumps({"type": "chunk", "content": chunk})
                    yield f"data: {chunk_event}\n\n"
                    await asyncio.sleep(0.05)  # 50ms delay for typing effect

                # Send final error event
                error_event = json.dumps({
                    "type": "error",
                    "code": e.detail.get("code", "RATE_LIMIT_EXCEEDED"),
                    "message": error_msg
                })
                yield f"data: {error_event}\n\n"
                return

            # Create or get conversation
            conversation_id = request.conversation_id
            if not conversation_id:
                conversation_id = create_conversation(db, user_id, initiated_by="user")

            # Save user message
            user_message_id = save_message(
                db=db,
                conversation_id=conversation_id,
                role="user",
                content=request.message
            )

            # Send metadata event with message IDs
            metadata_event = json.dumps({
                "type": "metadata",
                "message_id": str(user_message_id),
                "conversation_id": str(conversation_id)
            })
            yield f"data: {metadata_event}\n\n"

            # Story 6.2: Get active personality (UNIFIED with Story 6.1 presets)
            personality_details = None
            personality_type = "weave_ai"  # Default
            system_prompt = "You are Weave, a supportive AI coach."  # Fallback

            try:
                personality_service = PersonalityService(db)
                personality_details = await personality_service.get_active_personality(str(user_id))
                personality_type = personality_details.get('personality_type', 'weave_ai')
                system_prompt = personality_details.get('system_prompt', system_prompt)

                if personality_type == "weave_ai":
                    preset = personality_details.get('preset', 'gen_z_default')
                    logger.info(f"✅ [PERSONALITY] User {user_id} using Weave AI (preset: {preset})")
                else:
                    name = personality_details.get('name', 'Dream Self')
                    logger.info(f"✅ [PERSONALITY] User {user_id} using Dream Self: {name}")
            except Exception as e:
                logger.warning(f"⚠️  [PERSONALITY] Error getting personality for user {user_id}: {e}")

            # Build full prompt with user message
            full_prompt = f"{system_prompt}\n\nUser: {request.message}"

            # Story 6.2: Build user context if requested
            user_context = None
            context_used = False
            if request.include_context:
                try:
                    context_builder = ContextBuilderService(db)
                    user_context = await context_builder.build_context(str(user_id))
                    context_used = user_context is not None
                    if context_used:
                        logger.info(f"✅ [CONTEXT] Built context for user {user_id}")
                    else:
                        logger.warning(f"⚠️  [CONTEXT] Context assembly timed out for user {user_id}")
                except Exception as e:
                    logger.error(f"❌ [CONTEXT] Error building context for user {user_id}: {e}")
                    context_used = False

            # Stream AI response with model fallback chain (save message even if client disconnects)
            full_content = []
            tokens_used = 0
            cost_usd = 0.0
            run_id = None
            streaming_succeeded = False
            tools_invoked = []
            assistant_message_id = None  # Initialize to avoid UnboundLocalError

            # Story 6.2: AI-based tool classification
            try:
                logger.info(f"🔍 [TOOLS_FLOW] enable_tools={request.enable_tools}, message='{request.message[:100]}'")

                if request.enable_tools:
                    try:
                        logger.info(f"🔧 [TOOLS] Tool calling enabled - analyzing message with AI classifier")

                        # Step 1: Analyze message for tool triggers (AI-based classification)
                        tool_classifier = create_tool_classifier(ai_service)
                        logger.info(f"🏗️ [TOOLS] Tool classifier created, calling analyze_message...")

                        # ✅ FIX: analyze_message is NOT async - don't use await
                        triggered_tools = tool_classifier.analyze_message(request.message, str(user_id))

                        logger.info(f"🎯 [TOOLS] AI classifier returned {len(triggered_tools)} tool(s): {triggered_tools}")

                        # Step 2: Execute triggered tools immediately
                        tool_registry = get_tool_registry()
                        tool_execution_results = []

                        for tool_call in triggered_tools:
                            tool_name = tool_call['tool_name']
                            parameters = tool_call['parameters']
                            logger.info(f"🔄 [TOOLS] Executing tool: {tool_name} with params: {parameters}")

                            # Emit tool_start event
                            tool_start_event = json.dumps({
                                "type": "tool_start",
                                "tool_name": tool_name,
                                "tool_input": parameters
                            })
                            logger.info(f"📤 [TOOLS] Emitting tool_start event: {tool_start_event}")
                            yield f"data: {tool_start_event}\n\n"

                            # Execute tool
                            result = await tool_registry.execute_tool(tool_name, str(user_id), parameters)
                            logger.info(f"🎲 [TOOLS] Tool execution result: success={result.get('success')}, data={result.get('data')}, error={result.get('error')}")

                            tool_execution_results.append({
                                'tool_name': tool_name,
                                'input': parameters,
                                'success': result.get('success', False),
                                'result': result.get('data'),
                                'error': result.get('error')
                            })

                            # Emit tool result/error event
                            if result.get('success'):
                                tool_result_event = json.dumps({
                                    "type": "tool_result",
                                    "tool_name": tool_name,
                                    "tool_result": result.get('data', {})
                                })
                                logger.info(f"📤 [TOOLS] Emitting tool_result event: {tool_result_event}")
                                yield f"data: {tool_result_event}\n\n"
                                logger.info(f"✅ [TOOLS] Tool {tool_name} succeeded")
                            else:
                                tool_error_event = json.dumps({
                                    "type": "tool_error",
                                    "tool_name": tool_name,
                                    "tool_error": result.get('error', 'Unknown error')
                                })
                                logger.info(f"📤 [TOOLS] Emitting tool_error event: {tool_error_event}")
                                yield f"data: {tool_error_event}\n\n"
                                logger.error(f"❌ [TOOLS] Tool {tool_name} failed: {result.get('error')}")

                        tools_invoked = tool_execution_results
                        logger.info(f"✅ [TOOLS] Executed {len(tools_invoked)} tool(s)")

                        # Step 3: Build enhanced prompt with tool results
                        if tool_execution_results:
                            tool_results_summary = "\n\n".join([
                                f"Tool '{t['tool_name']}' executed:\n"
                                f"- Input: {t['input']}\n"
                                f"- Result: {t['result'] if t['success'] else 'ERROR: ' + str(t.get('error', 'Unknown error'))}"
                                for t in tool_execution_results
                            ])
                            enhanced_prompt = f"{full_prompt}\n\n[System: The following tools were executed:\n{tool_results_summary}\n\nPlease incorporate these results into your response naturally.]"
                        else:
                            enhanced_prompt = full_prompt

                        # Step 4: Stream AI response with tool results context
                        # Use regular streaming (not orchestrator) with enhanced prompt
                        for i, model_to_try in enumerate(models_to_try):
                            try:
                                logger.info(f"🔄 [TOOLS+STREAM] Generating response with model {i+1}/{len(models_to_try)}: {model_to_try}")

                                # Call AIService streaming with enhanced prompt (includes tool results)
                                async for chunk in ai_service.generate_stream(
                                    user_id=str(user_id),
                                    user_role='admin' if is_admin else 'user',
                                    user_tier=subscription_tier,
                                    module='chat',
                                    prompt=enhanced_prompt,
                                    model=model_to_try,
                                    max_tokens=500
                                ):
                                    if chunk['type'] == 'chunk':
                                        # Stream content chunk to frontend
                                        full_content.append(chunk['content'])
                                        chunk_event = json.dumps({
                                            "type": "chunk",
                                            "content": chunk['content']
                                        })
                                        yield f"data: {chunk_event}\n\n"

                                    elif chunk['type'] == 'done':
                                        # Store final metadata
                                        tokens_used = chunk.get('tokens_used', chunk.get('output_tokens', 0))
                                        cost_usd = chunk.get('cost_usd', 0.0)
                                        run_id = chunk.get('run_id')
                                        streaming_succeeded = True

                                logger.info(f"✅ [TOOLS+STREAM] Success with model: {model_to_try}")
                                model = model_to_try
                                break  # Success!

                            except Exception as stream_error:
                                logger.warning(f"⚠️  [TOOLS+STREAM] Model {model_to_try} failed: {stream_error}")
                                if i == len(models_to_try) - 1:  # Last model failed
                                    logger.error(f"💥 [TOOLS+STREAM] All models failed")
                                    fallback_text = "I executed your request, but I'm having trouble generating a response. Please check your data and try asking again."
                                    full_content = [fallback_text]
                                    chunk_event = json.dumps({"type": "chunk", "content": fallback_text})
                                    yield f"data: {chunk_event}\n\n"
                                # Continue to next model

                    except Exception as e:
                        logger.error(f"❌ [TOOLS] Tool-enabled generation failed: {e}")
                        # Fall back to regular streaming
                        request.enable_tools = False

                # Regular streaming generation (if tools disabled or failed)
                if not request.enable_tools:
                    try:
                        # Try each model in sequence for streaming
                        for i, model_to_try in enumerate(models_to_try):
                            try:
                                logger.info(f"🔄 [STREAMING_FALLBACK] Trying model {i+1}/{len(models_to_try)}: {model_to_try}")

                                # Call existing AIService streaming method
                                async for chunk in ai_service.generate_stream(
                                    user_id=str(user_id),
                                    user_role='admin' if is_admin else 'user',
                                    user_tier=subscription_tier,
                                    module='chat',  # ✅ Fixed: Use 'chat' not 'ai_chat' (must match enum in database)
                                    prompt=full_prompt,
                                    model=model_to_try,
                                    max_tokens=500
                                ):
                                    if chunk['type'] == 'chunk':
                                        # Stream content chunk to frontend
                                        full_content.append(chunk['content'])
                                        chunk_event = json.dumps({
                                            "type": "chunk",
                                            "content": chunk['content']
                                        })
                                        yield f"data: {chunk_event}\n\n"

                                    elif chunk['type'] == 'done':
                                        # Store final metadata
                                        tokens_used = chunk.get('tokens_used', chunk.get('output_tokens', 0))
                                        cost_usd = chunk.get('cost_usd', 0.0)
                                        run_id = chunk.get('run_id')
                                        streaming_succeeded = True

                                logger.info(f"✅ [STREAMING_FALLBACK] Success with model: {model_to_try}")
                                model = model_to_try  # Update model for usage tracking
                                break  # Success! Exit the loop

                            except Exception as e:
                                logger.warning(f"⚠️  [STREAMING_FALLBACK] Model {model_to_try} failed: {e}")
                                if i == len(models_to_try) - 1:  # Last model failed
                                    logger.error(f"💥 [STREAMING_FALLBACK] All models failed for user {user_id}")
                                    # Fallback response (deterministic)
                                    fallback_text = "I'm having trouble responding right now. Please try again in a moment."
                                    full_content = [fallback_text]

                                    # Send fallback as single chunk
                                    chunk_event = json.dumps({
                                        "type": "chunk",
                                        "content": fallback_text
                                    })
                                    yield f"data: {chunk_event}\n\n"
                                # Continue to next model

                    except Exception as inner_e:
                        logger.error(f"❌ [STREAMING_FALLBACK] Unexpected error: {inner_e}")

            finally:
                # ✅ FIX: ALWAYS save assistant message regardless of which path was taken
                # This executes whether tools were enabled or disabled
                response_text = ''.join(full_content) or "I'm having trouble responding right now."
                assistant_message_id = save_message(
                    db=db,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=response_text,
                    tokens_used=tokens_used
                )

                # Only increment usage if streaming actually succeeded
                # (don't count failed attempts or client disconnects)
                if streaming_succeeded and not is_admin:
                    rate_limiter.increment_usage(
                        user_id=str(user_id),
                        model=model,
                        bypass_admin_key=False
                    )

            # Send final metadata event
            done_event = json.dumps({
                "type": "done",
                "response_id": str(assistant_message_id) if assistant_message_id else None,
                "tokens_used": tokens_used,
                "cost_usd": cost_usd,
                "run_id": str(run_id) if run_id else None
            })
            yield f"data: {done_event}\n\n"

            logger.info(f"✅ Streaming complete for user {user_id}: {tokens_used} tokens, ${cost_usd:.6f}")

        except Exception as e:
            logger.error(f"Unexpected error in streaming: {e}")
            error_event = json.dumps({
                "type": "error",
                "code": "STREAMING_ERROR",
                "message": str(e)
            })
            yield f"data: {error_event}\n\n"

    # Return SSE stream with proper headers
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )


@router.get("/ai-chat/conversations", response_model=ConversationListResponseWrapper)
async def list_conversations(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client)
):
    """
    List user's conversation history.

    Returns:
        List of conversation summaries with last message preview
    """
    # Extract auth.uid from JWT token (Story 0.3)
    auth_user_id = user["sub"]

    user_id = get_user_id_from_auth(db, auth_user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail={
            "code": "USER_NOT_FOUND",
            "message": "User profile not found"
        })

    try:
        # Get conversations
        result = db.table('ai_chat_conversations') \
            .select('id, started_at, last_message_at, initiated_by') \
            .eq('user_id', str(user_id)) \
            .is_('deleted_at', 'null') \
            .order('last_message_at', desc=True) \
            .limit(50) \
            .execute()

        conversations = []
        for conv in result.data:
            # Get last message for preview
            msg_result = db.table('ai_chat_messages') \
                .select('content') \
                .eq('conversation_id', conv['id']) \
                .order('created_at', desc=True) \
                .limit(1) \
                .execute()

            last_message = msg_result.data[0]['content'] if msg_result.data else ""
            preview = last_message[:100] + "..." if len(last_message) > 100 else last_message

            conversations.append(ConversationSummary(
                id=UUID(conv['id']),
                started_at=datetime.fromisoformat(conv['started_at']),
                last_message_at=datetime.fromisoformat(conv['last_message_at']),
                initiated_by=conv['initiated_by'],
                last_message_preview=preview
            ))

        return ConversationListResponseWrapper(
            data=conversations,
            meta={
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "total": len(conversations)
            }
        )

    except Exception as e:
        logger.error(f"Error listing conversations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail={
            "code": "CONVERSATION_LIST_ERROR",
            "message": "Failed to list conversations"
        })


@router.get("/ai-chat/conversations/{conversation_id}", response_model=ConversationDetailResponseWrapper)
async def get_conversation(
    conversation_id: UUID,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get full conversation thread with all messages.

    Args:
        conversation_id: Conversation UUID

    Returns:
        Full conversation with all messages
    """
    # Extract auth.uid from JWT token (Story 0.3)
    auth_user_id = user["sub"]

    user_id = get_user_id_from_auth(db, auth_user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail={
            "code": "USER_NOT_FOUND",
            "message": "User profile not found"
        })

    try:
        # Get conversation (verify ownership via RLS)
        conv_result = db.table('ai_chat_conversations') \
            .select('id, started_at, last_message_at, initiated_by') \
            .eq('id', str(conversation_id)) \
            .eq('user_id', str(user_id)) \
            .single() \
            .execute()

        if not conv_result.data:
            raise HTTPException(status_code=404, detail={
                "code": "CONVERSATION_NOT_FOUND",
                "message": "Conversation not found"
            })

        conv = conv_result.data

        # Get all messages
        msg_result = db.table('ai_chat_messages') \
            .select('id, role, content, tokens_used, created_at') \
            .eq('conversation_id', str(conversation_id)) \
            .order('created_at', desc=False) \
            .execute()

        messages = [
            ChatMessage(
                id=UUID(msg['id']),
                role=msg['role'],
                content=msg['content'],
                created_at=datetime.fromisoformat(msg['created_at']),
                tokens_used=msg.get('tokens_used')
            )
            for msg in msg_result.data
        ]

        return ConversationDetailResponseWrapper(
            data=ConversationDetail(
                id=UUID(conv['id']),
                started_at=datetime.fromisoformat(conv['started_at']),
                last_message_at=datetime.fromisoformat(conv['last_message_at']),
                initiated_by=conv['initiated_by'],
                messages=messages
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail={
            "code": "CONVERSATION_GET_ERROR",
            "message": "Failed to get conversation"
        })


@router.get("/ai/usage", response_model=UsageStatsResponseWrapper)
async def get_usage_stats(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client),
    rate_limiter: TieredRateLimiter = Depends(get_tiered_rate_limiter)
):
    """
    Get user's current AI usage statistics.

    Returns:
        Usage stats with daily/monthly breakdowns:
        {
            "premium_today": {"used": 5, "limit": 10},
            "free_today": {"used": 20, "limit": 40},
            "monthly": {"used": 150, "limit": 500},
            "tier": "free" | "pro" | "admin"
        }
    """
    # Extract auth.uid from JWT token (Story 0.3)
    auth_user_id = user["sub"]

    user_id = get_user_id_from_auth(db, auth_user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail={
            "code": "USER_NOT_FOUND",
            "message": "User profile not found"
        })

    # Get user's subscription tier
    try:
        user_result = db.table('user_profiles').select('subscription_tier').eq('id', str(user_id)).single().execute()
        subscription_tier = user_result.data.get('subscription_tier', 'free') if user_result.data else 'free'
    except Exception as e:
        logger.warning(f"Error getting subscription tier for user {user_id}: {e}")
        subscription_tier = 'free'

    # Get usage stats from rate limiter
    stats = rate_limiter.get_usage_stats(str(user_id), subscription_tier)

    return UsageStatsResponseWrapper(
        data=UsageStats(
            premium_today=stats['premium_today'],
            free_today=stats['free_today'],
            monthly=stats['monthly'],
            tier=stats['tier']
        )
    )


@router.get("/personality")
async def get_personality(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get user's active personality configuration (Story 6.2).

    Returns personality details including:
    - personality_type: 'dream_self' or 'weave_ai'
    - name: Personality name
    - traits: Personality traits or style tags
    - speaking_style: Description of communication style
    - system_prompt: AI system prompt (for backend use)
    - preset: Weave AI preset name (if weave_ai)

    This endpoint is used by the frontend to display personality info
    and personalize greetings in the AI chat interface.
    """
    # Extract auth.uid from JWT token
    auth_user_id = user["sub"]

    user_id = get_user_id_from_auth(db, auth_user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail={
            "code": "USER_NOT_FOUND",
            "message": "User profile not found"
        })

    try:
        personality_service = PersonalityService(db)
        personality_data = await personality_service.get_active_personality(str(user_id))

        return {
            "data": personality_data,
            "meta": {
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }

    except Exception as e:
        logger.error(f"Error getting personality for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail={
            "code": "PERSONALITY_GET_ERROR",
            "message": "Failed to get personality configuration"
        })


@router.post("/admin/trigger-checkin/{user_id}")
async def trigger_checkin(
    user_id: UUID,
    db: SupabaseClient = Depends(get_supabase_client),
    is_admin: bool = Depends(check_admin_key)
):
    """
    Manually trigger a check-in for a user (admin only).

    Requires X-Admin-Key header with valid admin API key.

    Args:
        user_id: User ID to trigger check-in for

    Returns:
        Success message with conversation ID
    """
    if not is_admin:
        raise HTTPException(status_code=403, detail={
            "code": "ADMIN_KEY_REQUIRED",
            "message": "Valid X-Admin-Key header required"
        })

    try:
        # Verify user exists
        user_result = db.table('user_profiles').select('id, display_name').eq('id', str(user_id)).single().execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail={
                "code": "USER_NOT_FOUND",
                "message": f"User {user_id} not found"
            })

        # Create system-initiated conversation
        conversation_id = create_conversation(db, user_id, initiated_by="system")

        # Create contextual check-in message
        hour = datetime.now().hour
        if hour < 12:
            message = "Good morning! Ready to make today count?"
        elif hour < 17:
            message = "Hey! How's your day going so far?"
        else:
            message = "Evening check-in: How did today go?"

        # Save system message
        save_message(
            db=db,
            conversation_id=conversation_id,
            role="system",
            content=message
        )

        # Update last_checkin_at
        db.table('user_profiles').update({
            'last_checkin_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', str(user_id)).execute()

        logger.info(f"✅ Admin-triggered check-in for user {user_id}: conversation {conversation_id}")

        return {
            "data": {
                "success": True,
                "conversation_id": str(conversation_id),
                "message": message
            },
            "meta": {
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering check-in for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail={
            "code": "CHECKIN_TRIGGER_ERROR",
            "message": f"Failed to trigger check-in: {str(e)}"
        })
