# Frontend AI Service Integration Guide

**Last Updated:** 2025-12-19

Complete guide for integrating the AI service from React Native frontend, including real-time streaming, error handling, and best practices.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Basic AI API Calls](#basic-ai-api-calls)
4. [Real-Time Streaming](#real-time-streaming)
5. [TanStack Query Integration](#tanstack-query-integration)
6. [Error Handling](#error-handling)
7. [Production Considerations](#production-considerations)

---

## Architecture Overview

### Request Flow

```
React Native App (weave-mobile)
        ↓
   API Client (axios/fetch)
        ↓
   FastAPI Backend (weave-api)
        ↓
   AI Service Orchestrator
        ↓
   Provider Chain: Bedrock → OpenAI → Anthropic → Deterministic
        ↓
   Response (JSON or SSE stream)
        ↓
   React Native UI
```

### API Endpoint

```
POST /api/ai/generate
```

**Request:**
```json
{
  "module": "triad",
  "prompt": "Generate my daily plan",
  "model": "gpt-4o-mini",
  "max_tokens": 500,
  "stream": false
}
```

**Response:**
```json
{
  "data": {
    "content": "Based on your progress...",
    "input_tokens": 50,
    "output_tokens": 150,
    "cost_usd": 0.0002,
    "provider": "openai",
    "cached": false,
    "run_id": "run_abc123"
  },
  "meta": {
    "timestamp": "2025-12-19T10:30:00Z"
  }
}
```

---

## Environment Setup

### Development Environment

**Local backend URL:**

```typescript
// weave-mobile/src/constants/config.ts
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000',
    timeout: 30000, // 30 seconds for AI calls
  },
  production: {
    baseURL: 'https://api.weave.app',
    timeout: 30000,
  },
};

export const getAPIUrl = () => {
  return __DEV__ ? API_CONFIG.development : API_CONFIG.production;
};
```

### API Client Setup

**Create AI service client:**

```typescript
// weave-mobile/src/services/aiClient.ts
import axios from 'axios';
import { getAPIUrl } from '@/constants/config';
import { getAuthToken } from '@/services/auth';

const aiClient = axios.create({
  baseURL: getAPIUrl().baseURL,
  timeout: getAPIUrl().timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
aiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle rate limits, budget exceeded, etc.
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (error.response?.status === 402) {
      throw new Error('Daily budget exceeded. Using cached responses only.');
    }
    throw error;
  }
);

export default aiClient;
```

---

## Basic AI API Calls

### Example: Generate Daily Triad

**Service layer:**

```typescript
// weave-mobile/src/services/aiService.ts
import aiClient from './aiClient';

export interface AIGenerateRequest {
  module: 'onboarding' | 'triad' | 'recap' | 'dream_self' | 'weekly_insights';
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIGenerateResponse {
  content: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  provider: 'bedrock' | 'openai' | 'anthropic' | 'deterministic' | 'cache';
  cached: boolean;
  run_id: string;
}

export const generateAI = async (
  request: AIGenerateRequest
): Promise<AIGenerateResponse> => {
  const response = await aiClient.post('/api/ai/generate', request);
  return response.data.data;
};
```

**React component:**

```typescript
// weave-mobile/src/screens/DailyPlan.tsx
import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Button } from '@/design-system';
import { generateAI } from '@/services/aiService';

export const DailyPlanScreen = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAI({
        module: 'triad',
        prompt: 'Generate my daily plan based on current goals',
        model: 'gpt-4o-mini', // Cheap model for routine operations
        max_tokens: 500,
      });

      setPlan(result.content);
      console.log('AI cost:', result.cost_usd);
      console.log('Provider:', result.provider);
      console.log('Cached:', result.cached);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button onPress={generatePlan} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Daily Plan'}
      </Button>

      {loading && <ActivityIndicator />}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {plan && <Text>{plan}</Text>}
    </View>
  );
};
```

---

## Real-Time Streaming

For long AI responses, stream content in real-time using Server-Sent Events (SSE).

### Backend Implementation

**Add streaming endpoint:**

```python
# weave-api/app/api/ai_router.py (NEW ENDPOINT)
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.services.ai.ai_service import AIService
import json

router = APIRouter()

@router.post("/ai/generate/stream")
async def generate_ai_stream(
    request: AIGenerateRequest,
    current_user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    """Stream AI response in real-time using SSE."""

    ai_service = AIService(db, openai_key, anthropic_key, aws_region)

    async def event_generator():
        """Generate SSE events."""
        try:
            # Start generation
            yield f"data: {json.dumps({'type': 'start'})}\n\n"

            # Call AI service (with streaming support in provider)
            response = ai_service.generate(
                user_id=current_user['id'],
                user_role=current_user.get('role', 'user'),
                user_tier=current_user.get('tier', 'free'),
                module=request.module,
                prompt=request.prompt,
                stream=True,  # Enable streaming
            )

            # Stream content chunks
            for chunk in response.stream():
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

            # Send completion
            yield f"data: {json.dumps({'type': 'done', 'metadata': {'cost': response.cost_usd}})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
```

### Frontend Implementation

**Install SSE library:**

```bash
cd weave-mobile
npm install react-native-sse
```

**Streaming component:**

```typescript
// weave-mobile/src/hooks/useAIStream.ts
import { useState, useCallback } from 'react';
import EventSource from 'react-native-sse';
import { getAPIUrl } from '@/constants/config';
import { getAuthToken } from '@/services/auth';

export interface AIStreamOptions {
  module: string;
  prompt: string;
  model?: string;
  onChunk?: (chunk: string) => void;
  onComplete?: (metadata: any) => void;
  onError?: (error: string) => void;
}

export const useAIStream = () => {
  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(async (options: AIStreamOptions) => {
    setStreaming(true);
    setContent('');
    setError(null);

    const token = await getAuthToken();
    const apiUrl = getAPIUrl().baseURL;

    const es = new EventSource(`${apiUrl}/api/ai/generate/stream`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        module: options.module,
        prompt: options.prompt,
        model: options.model || 'gpt-4o-mini',
      }),
    });

    es.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'start':
          console.log('Stream started');
          break;

        case 'chunk':
          setContent((prev) => prev + data.content);
          options.onChunk?.(data.content);
          break;

        case 'done':
          console.log('Stream completed:', data.metadata);
          options.onComplete?.(data.metadata);
          setStreaming(false);
          es.close();
          break;

        case 'error':
          setError(data.message);
          options.onError?.(data.message);
          setStreaming(false);
          es.close();
          break;
      }
    });

    es.addEventListener('error', (error) => {
      console.error('SSE error:', error);
      setError('Connection error');
      setStreaming(false);
      es.close();
    });

    return () => es.close();
  }, []);

  return { streaming, content, error, startStream };
};
```

**React component with streaming:**

```typescript
// weave-mobile/src/screens/DreamSelfChat.tsx
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card } from '@/design-system';
import { useAIStream } from '@/hooks/useAIStream';

export const DreamSelfChatScreen = () => {
  const { streaming, content, error, startStream } = useAIStream();

  const askQuestion = async () => {
    await startStream({
      module: 'dream_self',
      prompt: 'What steps should I take to achieve my career goals?',
      model: 'claude-3-7-sonnet-20250219', // Use Sonnet for quality
      onChunk: (chunk) => {
        console.log('Received chunk:', chunk);
      },
      onComplete: (metadata) => {
        console.log('Cost:', metadata.cost);
      },
      onError: (err) => {
        console.error('Stream error:', err);
      },
    });
  };

  return (
    <ScrollView>
      <Card>
        <Button onPress={askQuestion} disabled={streaming}>
          {streaming ? 'Thinking...' : 'Ask Dream Self'}
        </Button>

        {streaming && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <ActivityIndicator />
            <Text style={{ marginLeft: 8 }}>Streaming response...</Text>
          </View>
        )}

        {error && (
          <Text style={{ color: 'red', marginTop: 16 }}>{error}</Text>
        )}

        {content && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, lineHeight: 24 }}>
              {content}
            </Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};
```

**Result:** User sees AI response appear word-by-word in real-time, like ChatGPT!

---

## TanStack Query Integration

**Cache AI responses and manage loading states:**

```typescript
// weave-mobile/src/hooks/useGenerateAI.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateAI, AIGenerateRequest, AIGenerateResponse } from '@/services/aiService';

export const useGenerateAI = () => {
  const queryClient = useQueryClient();

  return useMutation<AIGenerateResponse, Error, AIGenerateRequest>({
    mutationFn: generateAI,
    onSuccess: (data, variables) => {
      // Cache the result
      queryClient.setQueryData(
        ['ai', variables.module, variables.prompt],
        data
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['ai', variables.module] });
    },
    onError: (error) => {
      console.error('AI generation error:', error.message);
    },
  });
};
```

**Usage in component:**

```typescript
// weave-mobile/src/screens/Onboarding.tsx
import { useGenerateAI } from '@/hooks/useGenerateAI';

export const OnboardingScreen = () => {
  const { mutate: generateAI, isPending, data, error } = useGenerateAI();

  const handleGoalBreakdown = () => {
    generateAI({
      module: 'onboarding',
      prompt: 'Break down my goal: Learn to code',
      model: 'gpt-4o-mini',
      max_tokens: 500,
    });
  };

  return (
    <View>
      <Button onPress={handleGoalBreakdown} disabled={isPending}>
        {isPending ? 'Generating...' : 'Break Down Goal'}
      </Button>

      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}

      {data && (
        <View>
          <Text>{data.content}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Cost: ${data.cost_usd.toFixed(6)} | Provider: {data.provider}
            {data.cached && ' (Cached)'}
          </Text>
        </View>
      )}
    </View>
  );
};
```

---

## Error Handling

### Rate Limit Handling

```typescript
// weave-mobile/src/services/aiClient.ts (continued)
aiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // Rate limit exceeded
      const resetTime = error.response.headers['x-ratelimit-reset'];
      throw new Error(
        `Rate limit exceeded. Try again in ${resetTime} seconds.`
      );
    }

    if (error.response?.status === 402) {
      // Budget exceeded
      throw new Error(
        'Daily AI budget reached. Using cached responses only until tomorrow.'
      );
    }

    if (error.response?.status === 503) {
      // All providers failed (shouldn't happen with deterministic fallback)
      throw new Error(
        'AI service temporarily unavailable. Please try again.'
      );
    }

    throw error;
  }
);
```

### User-Friendly Error Messages

```typescript
// weave-mobile/src/utils/aiErrors.ts
export const getAIErrorMessage = (error: any): string => {
  const status = error.response?.status;
  const message = error.response?.data?.error?.message || error.message;

  switch (status) {
    case 429:
      return 'You've reached your AI request limit. Please try again in an hour.';
    case 402:
      return 'Daily AI budget reached. Showing cached responses only.';
    case 503:
      return 'AI service is temporarily unavailable. Please try again.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
};
```

**Usage:**

```typescript
const { mutate, error } = useGenerateAI();

{error && (
  <Text style={{ color: 'red' }}>
    {getAIErrorMessage(error)}
  </Text>
)}
```

---

## Production Considerations

### 1. Environment Variables

**Production API URL:**

```typescript
// weave-mobile/.env.production
API_BASE_URL=https://api.weave.app
API_TIMEOUT=30000
```

```typescript
// weave-mobile/src/constants/config.ts
import Constants from 'expo-constants';

export const API_CONFIG = {
  baseURL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000',
  timeout: Constants.expoConfig?.extra?.apiTimeout || 30000,
};
```

### 2. Request Timeouts

AI requests can take 10-30 seconds:

```typescript
const aiClient = axios.create({
  timeout: 30000, // 30 seconds (not the default 10s)
});
```

### 3. Retry Logic

```typescript
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(aiClient, {
  retries: 2, // Retry failed requests 2 times
  retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status >= 500;
  },
});
```

### 4. Cache AI Responses

Use TanStack Query cache to minimize duplicate API calls:

```typescript
const { data } = useQuery({
  queryKey: ['ai', 'triad', userId, date],
  queryFn: () => generateAI({ module: 'triad', prompt: '...' }),
  staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  gcTime: 1000 * 60 * 60 * 48, // Keep in memory for 48 hours
});
```

### 5. Cost Monitoring

Show AI cost to users (optional, for transparency):

```typescript
{data && (
  <View>
    <Text>{data.content}</Text>
    {__DEV__ && (
      <Text style={{ fontSize: 10, color: '#999' }}>
        AI cost: ${data.cost_usd.toFixed(6)} | {data.provider}
      </Text>
    )}
  </View>
)}
```

---

## Summary: Development vs Production

### Development

```typescript
// Local backend
baseURL: 'http://localhost:8000'

// Use cheap models for testing
model: 'gpt-4o-mini' // $0.15/$0.60 per MTok

// Show debug info
console.log('AI cost:', response.cost_usd);
console.log('Provider:', response.provider);
console.log('Cached:', response.cached);
```

### Production

```typescript
// Production API
baseURL: 'https://api.weave.app'

// Use optimal models
model: request.module === 'dream_self'
  ? 'claude-3-7-sonnet-20250219' // Quality-critical
  : 'gpt-4o-mini' // Routine operations

// Hide debug info
// Don't log costs to console in production

// Enable caching aggressively
staleTime: 1000 * 60 * 60 * 24 // 24 hours
```

---

## Quick Reference

**Basic AI Call:**
```typescript
const response = await generateAI({
  module: 'triad',
  prompt: 'Generate my daily plan',
  model: 'gpt-4o-mini',
});
```

**Streaming AI Call:**
```typescript
const { startStream, content } = useAIStream();
startStream({
  module: 'dream_self',
  prompt: 'What should I focus on?',
  onChunk: (chunk) => console.log(chunk),
});
```

**TanStack Query:**
```typescript
const { mutate, isPending, data } = useGenerateAI();
mutate({ module: 'recap', prompt: '...' });
```

---

**Next:** See `docs/dev/ai-service-guide.md` for backend implementation details.
