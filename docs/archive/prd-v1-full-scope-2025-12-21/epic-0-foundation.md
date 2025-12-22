# Epic 0: Foundation

## Overview

Before any user-facing features can be built, the development team must have a fully scaffolded, secure, and testable codebase with authentication, database, and AI infrastructure ready.

## User Stories

### US-0.1: Project Scaffolding

**Priority:** M (Must Have)

**As a** developer
**I want to** have a properly initialized Expo and FastAPI project
**So that** I can begin implementing features with the correct tech stack

**Acceptance Criteria:**
- [ ] Initialize Expo app using `npx create-expo-app` with blank-typescript template
- [ ] Use Expo SDK 53, React Native 0.79, React 19, Expo Router v5
- [ ] Initialize backend using `uv init` with FastAPI, uvicorn
- [ ] Use Python 3.11+, FastAPI 0.115+
- [ ] Configure NativeWind (Tailwind CSS for React Native) for styling
- [ ] Set up TanStack Query with `networkMode: 'offlineFirst'`
- [ ] Configure Zustand for shared UI state

**Story Points:** 5

---

### US-0.2: Supabase Setup

**Priority:** M (Must Have)

**As a** developer
**I want to** have Supabase configured with the database schema
**So that** authentication and data persistence work correctly

**Acceptance Criteria:**
- [ ] Create Supabase project with PostgreSQL database
- [ ] Run initial migrations for 8 core tables:
  - user_profiles, identity_docs, goals, subtask_templates
  - subtask_instances, subtask_completions, captures, journal_entries
- [ ] Configure Supabase Storage for user uploads
- [ ] Set up critical indexes on frequently queried columns
- [ ] Implement snake_case for database columns

**Story Points:** 5

---

### US-0.3: Authentication Flow

**Priority:** M (Must Have)

**As a** user
**I want to** be able to sign up and log in securely
**So that** my data is protected and associated with my account

**Acceptance Criteria:**
- [ ] Implement Supabase Auth with email + OAuth (Google, Apple)
- [ ] JWT token expiration set to 7 days
- [ ] Implement refresh token rotation
- [ ] Session management with secure storage
- [ ] Logout functionality clears local session

**Story Points:** 3

---

### US-0.4: Row Level Security (RLS)

**Priority:** M (Must Have) - **CRITICAL: Must complete before alpha release**

**As a** user
**I want to** know my data is secure from other users
**So that** I can trust the app with my personal reflections and goals

**Acceptance Criteria:**
- [ ] RLS policies on ALL user-owned tables (CRITICAL)
- [ ] Users can only SELECT/INSERT/UPDATE/DELETE own data
- [ ] API endpoint authorization validates user ownership
- [ ] Test RLS policies with multiple test users
- [ ] Document RLS policies in security documentation

**Story Points:** 5

---

### US-0.5: CI/CD Pipeline

**Priority:** M (Must Have)

**As a** developer
**I want to** have automated testing and deployment
**So that** code quality is maintained and releases are consistent

**Acceptance Criteria:**
- [ ] GitHub Actions for linting (ESLint, Black)
- [ ] GitHub Actions for type checking (TypeScript, mypy)
- [ ] GitHub Actions for running tests
- [ ] Expo EAS Build configured for iOS
- [ ] Railway deployment configured for FastAPI backend
- [ ] Environment variable management for staging/production

**Story Points:** 3

---

### US-0.6: AI Service Abstraction

**Priority:** M (Must Have)

**As a** developer
**I want to** have an abstracted AI provider layer
**So that** we can switch providers and implement fallbacks without changing business logic

**Acceptance Criteria:**
- [ ] Abstract AI provider interface supporting OpenAI and Anthropic
- [ ] Implement fallback chain: OpenAI → Anthropic → Deterministic
- [ ] Cost tracking with `input_tokens`, `output_tokens`, `model`, `cost_usd`
- [ ] Daily budget alerts at $83.33/day threshold
- [ ] Auto-throttle to cache-only mode at 100% daily budget
- [ ] Rate limiting: 10 AI calls/hour per user

**Story Points:** 3

---

### US-0.7: Test Infrastructure

**Priority:** M (Must Have)

**As a** developer
**I want to** have testing infrastructure set up
**So that** I can write and run tests for new features

**Acceptance Criteria:**
- [ ] Jest configured for React Native mobile testing
- [ ] pytest configured for FastAPI backend testing
- [ ] Test fixture factories for common entities (user, goal, subtask)
- [ ] Test database seeding scripts
- [ ] Minimum 1 integration test demonstrating the pattern

**Story Points:** 1

---

### US-0.8: Error Handling Framework

**Priority:** M (Must Have)

**As a** developer
**I want to** have a consistent error handling framework
**So that** users receive helpful error messages and errors are properly logged

**Acceptance Criteria:**
- [ ] Define standard error response format: `{error: {code, message, retryable, retryAfter?}}`
- [ ] Establish HTTP status codes for each error type:
  - 400 for validation errors
  - 401 for authentication errors
  - 429 for rate limiting
  - 500 for server errors
  - 503 for AI service unavailable
- [ ] Create error response utilities for backend
- [ ] Create error handling hooks for mobile (API errors, network errors, AI errors)
- [ ] Document all error codes in `/docs/api-error-codes.md`

**Technical Notes:**
- All API endpoints must return consistent error format
- Mobile should handle errors gracefully with user-friendly messages
- Error handling smoke tests must pass

**Story Points:** 3

---

### US-0.9: Image Upload Error Handling

**Priority:** M (Must Have)

**As a** user
**I want to** understand what went wrong when image uploads fail
**So that** I can take corrective action

**Acceptance Criteria:**
- [ ] Implement file validation: Max 10MB, JPEG/PNG only, minimum 100x100px
- [ ] Handle error scenarios:
  - File too large
  - Invalid file format
  - Storage quota exceeded
  - Upload timeout
- [ ] Display progress UI with upload progress bar and cancel button
- [ ] Implement retry logic with 3 attempts using exponential backoff
- [ ] Queue failed uploads locally for retry when connection returns

**Technical Notes:**
- User sees clear, actionable error messages
- Failed uploads automatically retry when online
- Supabase Storage integration with signed URLs

**Story Points:** 3

---

### US-0.10: Memory System Architecture Decision

**Priority:** M (Must Have)

**As a** developer
**I want to** have a clear memory storage architecture
**So that** AI can recall user context without over-engineering

**Acceptance Criteria:**
- [ ] Decision documented: Simple PostgreSQL TEXT[] arrays (no vector DB for MVP)
- [ ] Implement basic keyword search (no semantic/vector search yet)
- [ ] Define memory lifecycle: Created on journal submit, pruned at 100 memories per user
- [ ] Document memory schema in architecture docs
- [ ] Implement memory retrieval strategy for AI context

**Technical Notes:**
- Keep it simple for MVP - no fancy vector embeddings
- Memory storage works and retrieval returns relevant memories
- Can be enhanced with vector search post-MVP if needed

**Story Points:** 2

---

## Epic 0 Summary

| Metric | Value |
|--------|-------|
| Total Story Points | 38 |
| Priority M (Must Have) | 10 |
| Priority S (Should Have) | 0 |
| Dependencies | None (True Foundation) |

---
