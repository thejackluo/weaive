# PR Splitting Guide: Keeping Story PRs Under 800 Lines

## The Problem

**Stories can be 1000+ lines, but PRs should be max 800 lines.**

**Solution:** Split large stories into multiple PRs using sub-branches while keeping the story as the organizing unit.

## Quick Decision Tree

```
Is your story implementation > 600 lines?
├─ NO → Create single PR to main
└─ YES → Split into multiple PRs (see below)
```

## Branch Structure for Split PRs

```
main
 │
 └── story/4.1-daily-reflection          (parent story branch)
       │
       ├── story/4.1-daily-reflection/part-1-ui
       │     └── PR #1: UI Components (350 lines)
       │
       ├── story/4.1-daily-reflection/part-2-api
       │     └── PR #2: API Integration (400 lines)
       │
       └── story/4.1-daily-reflection/part-3-tests
             └── PR #3: Tests & Polish (300 lines)
```

## Step-by-Step Workflow

### Step 1: Start Story Branch (Normal)

```bash
git checkout main
git pull origin main
git checkout -b story/4.1-daily-reflection
```

### Step 2: Implement Part 1 (Foundation)

Implement the **foundation layer** first:
- Shared types and utilities
- Database migrations (if any)
- Design system components
- Base configuration

```bash
# Still on story/4.1-daily-reflection
# ... implement Part 1 code ...
# Check line count before committing
git diff --stat
```

### Step 3: Create Sub-Branch for Part 1

```bash
# Create sub-branch FROM story branch
git checkout -b story/4.1-daily-reflection/part-1-ui

# Commit Part 1 work
git add <part-1-files>
git commit -m "feat(4.1): part 1 - reflection form UI components"

# Push and create PR
git push -u origin story/4.1-daily-reflection/part-1-ui

gh pr create --base main \
  --title "Story 4.1 Part 1: Reflection Form UI Components" \
  --body "$(cat <<'EOF'
## What
Part 1 of 3 for Story 4.1: Daily Reflection Entry
UI components and design system integration for reflection form.

## Why
Split to keep PR reviewable (~350 lines).
Part 1 establishes foundation for Part 2 (API) and Part 3 (tests).

**Story Context:** docs/stories/4-1-daily-reflection-entry.md
**Dependencies:** None (foundation)
**Follow-up PRs:** Part 2 (API), Part 3 (Tests)

## How
- Added ReflectionForm component with validation
- Created FulfillmentSlider with haptic feedback
- Integrated with design system tokens
- Added animation support

## Testing
- [ ] Form renders correctly
- [ ] Validation works (1-10 scale)
- [ ] Animations smooth
- [ ] No breaking changes

**Note:** Full story acceptance criteria validated after all parts merge.
EOF
)"
```

### Step 4: Return to Parent Branch for Part 2

```bash
# Go back to parent story branch
git checkout story/4.1-daily-reflection

# Continue implementing Part 2 (API integration)
# ... implement Part 2 code ...
```

### Step 5: Create Sub-Branch for Part 2

```bash
git checkout -b story/4.1-daily-reflection/part-2-api

git add <part-2-files>
git commit -m "feat(4.1): part 2 - API integration and submission flow"

git push -u origin story/4.1-daily-reflection/part-2-api

gh pr create --base main \
  --title "Story 4.1 Part 2: API Integration and Submission Flow"
```

### Step 6: Repeat for Part 3 (Tests)

```bash
git checkout story/4.1-daily-reflection

# Implement tests and polish
# ...

git checkout -b story/4.1-daily-reflection/part-3-tests
git add <test-files>
git commit -m "feat(4.1): part 3 - tests and documentation"
git push -u origin story/4.1-daily-reflection/part-3-tests

gh pr create --base main --title "Story 4.1 Part 3: Tests and Documentation"
```

## How to Split: The Parts Strategy

### Part 1: Foundation (200-400 lines)
**What to include:**
- Shared utilities and types
- Database migrations
- Design system components
- Configuration files
- Base interfaces

**Example (Story 0.3 Authentication):**
- `GlassButton.tsx` component
- `auth-types.ts` TypeScript interfaces
- Design system color tokens
- Dependencies in `package.json`

### Part 2: Core Implementation (300-500 lines)
**What to include:**
- Main feature logic
- API endpoints
- Business logic
- Service layer
- State management

**Example (Story 0.3 Authentication):**
- `lib/auth-oauth.ts` OAuth helpers
- Google Sign-In integration
- Apple Sign-In integration
- Session management
- Error handling

### Part 3: Integration & Tests (200-400 lines)
**What to include:**
- UI integration
- User-facing screens
- Navigation updates
- Test files
- Documentation

**Example (Story 0.3 Authentication):**
- Auth success screen
- Navigation flow updates
- Integration tests
- API documentation
- Implementation summary

## PR Description Template for Split PRs

```markdown
## What
Part [X] of [Y] for Story [ID]: [Story Name]
[Specific part description - e.g., "UI components and design system integration"]

## Why
Split to keep PR reviewable (~[line count] lines).
Part [X] [relationship to other parts].

**Story Context:** docs/stories/[story-file].md
**Dependencies:** [None | Part 1 merged]
**Follow-up PRs:** [Part 2 (API), Part 3 (Tests)]

## How
- [Bullet 1: What was added/changed]
- [Bullet 2: What was added/changed]
- [Bullet 3: What was added/changed]

## Testing
- [ ] [Test item 1]
- [ ] [Test item 2]
- [ ] [Test item 3]
- [ ] No breaking changes

**Note:** Full story acceptance criteria validated after all parts merge.
```

## Merge Strategy

### Option A: Sequential Merge (Recommended)

```
1. Review & merge Part 1 → main
2. Review & merge Part 2 → main (includes Part 1 changes)
3. Review & merge Part 3 → main (includes Part 1 + 2 changes)
```

**Advantages:**
- Simple linear history
- Each part builds on previous
- Clear progression

**How to handle:**
```bash
# After Part 1 merges to main
git checkout story/4.1-daily-reflection
git merge main  # Pull in merged Part 1

# Continue with Part 2
git checkout story/4.1-daily-reflection/part-2-api
git rebase main  # Rebase onto latest main
```

### Option B: Parallel Development (Advanced)

```
1. Part 1 → main (foundation)
2. Part 2 branches from Part 1 (not main)
3. Part 3 branches from Part 2 (not main)
```

**Use when:** Parts are independent enough to develop in parallel.

**Warning:** Requires careful coordination to avoid conflicts.

## When to Split vs. When Not to Split

### ✅ Split if:
- Story changes exceed **600 lines** (before tests)
- Story has **clear logical boundaries** (UI vs. API vs. tests)
- Parts can be **merged independently** without breaking functionality
- Parts deliver **independent value**

### ❌ Don't split if:
- Story is **under 600 lines**
- Changes are **tightly coupled** (can't separate cleanly)
- Splitting would **break tests or functionality**
- Story is **already atomic** (single responsibility)

## Checking Line Counts

### Before Creating PR

```bash
# Check total lines changed
git diff --stat

# Check lines in specific files
git diff --numstat <file>

# Count lines excluding package-lock.json, generated files
git diff --stat -- . ':!package-lock.json' ':!*.generated.*'
```

### Ideal Line Counts

| PR Type | Ideal Lines | Max Lines | Notes |
|---------|-------------|-----------|-------|
| **Small refactor** | 50-100 | 200 | Single file, focused change |
| **Feature (single PR)** | 200-400 | 600 | Complete feature in one PR |
| **Feature (split)** | 300-500 per part | 800 per part | Multi-part story |
| **Bug fix** | 10-50 | 100 | Targeted fix + test |

**Excludes:** Generated files, `package-lock.json`, `uv.lock`, migration files

## Documenting the Split in Story File

Update the story file to document the split:

```markdown
## Implementation Notes

**PR Strategy:** Split into 3 parts for reviewability

- **Part 1:** UI Components (PR #X) - 350 lines
  - ReflectionForm component
  - FulfillmentSlider component
  - Design system integration

- **Part 2:** API Integration (PR #Y) - 400 lines
  - POST /journal-entries endpoint
  - Validation logic
  - Error handling

- **Part 3:** Tests & Polish (PR #Z) - 300 lines
  - Component tests
  - Integration tests
  - API documentation
  - Implementation summary

**Total:** ~1050 lines across 3 PRs
```

## Story Completion Checklist

After all parts are merged:

- [ ] All story acceptance criteria met
- [ ] All tests passing (unit + integration)
- [ ] Code review completed for all parts
- [ ] Story marked as `DONE` in `sprint-status.yaml`
- [ ] Implementation summary created in `docs/sprint-artifacts/`
- [ ] Parent story branch deleted

## Common Mistakes

### ❌ Mistake 1: Creating Too Many Parts

**Bad:**
```
Part 1: Add Button component (50 lines)
Part 2: Add Form component (60 lines)
Part 3: Add Input component (55 lines)
Part 4: Add validation (80 lines)
Part 5: Add tests (100 lines)
```

**Good:**
```
Part 1: UI Foundation - Button, Form, Input components (200 lines)
Part 2: Validation & Integration (250 lines)
Part 3: Tests & Documentation (150 lines)
```

**Why:** Too many tiny PRs create review fatigue and slow down merging.

### ❌ Mistake 2: Splitting Mid-Feature

**Bad:**
```
Part 1: Add half of authentication flow (400 lines)
Part 2: Add other half of authentication flow (400 lines)
```

**Good:**
```
Part 1: Auth UI components (350 lines)
Part 2: OAuth integration (400 lines)
Part 3: Session management (300 lines)
```

**Why:** Each part should deliver independent, testable value.

### ❌ Mistake 3: Not Updating Parent Branch

**Bad:**
```bash
# Create Part 1 sub-branch
git checkout -b story/4.1/part-1
# ... commit Part 1 ...

# After Part 1 merges, create Part 2 from OLD story branch
git checkout story/4.1  # STILL HAS PART 1 CODE
git checkout -b story/4.1/part-2  # INCLUDES PART 1 AGAIN
```

**Good:**
```bash
# After Part 1 merges to main
git checkout story/4.1
git merge main  # Pull in merged Part 1 changes

# Now create Part 2 (doesn't duplicate Part 1)
git checkout -b story/4.1/part-2
```

### ❌ Mistake 4: Submitting All Parts at Once

**Bad:**
```bash
# Create all 3 PRs simultaneously before any merge
gh pr create --base main --head story/4.1/part-1
gh pr create --base main --head story/4.1/part-2  # ❌ Includes Part 1 code
gh pr create --base main --head story/4.1/part-3  # ❌ Includes Part 1 + 2 code
```

**Good:**
```bash
# Submit Part 1
gh pr create --base main --head story/4.1/part-1

# Wait for Part 1 to merge, then submit Part 2
# (after merging main into parent branch)
gh pr create --base main --head story/4.1/part-2
```

## Real-World Example: Story 0.3 Authentication Flow

### Original Story Size
**Total changes:** ~1,200 lines across 12 files

### How It Was Split

#### Part 1: Auth UI Components (PR #45) - 400 lines
**Files:**
- `weave-mobile/src/design-system/components/GlassButton.tsx` (new)
- `weave-mobile/app/(auth)/login.tsx` (updated)
- `weave-mobile/src/design-system/tokens/colors.ts` (updated)
- `weave-mobile/package.json` (dependencies)

**Acceptance Criteria:**
- [x] GlassButton component renders with glass morphism effect
- [x] Auth screens use new design system
- [x] Gradient backgrounds work on iOS and Android

#### Part 2: OAuth Integration (PR #46) - 450 lines
**Files:**
- `weave-mobile/src/lib/auth-oauth.ts` (new)
- `weave-mobile/src/services/supabase.ts` (updated)
- `weave-mobile/app/(auth)/auth-success.tsx` (new)

**Acceptance Criteria:**
- [x] Google Sign-In works end-to-end
- [x] Apple Sign-In works on iOS
- [x] Session tokens persist securely
- [x] Error handling for network failures

#### Part 3: Tests & Documentation (PR #47) - 350 lines
**Files:**
- `weave-mobile/src/components/__tests__/auth-flow.test.tsx` (new)
- `docs/sprint-artifacts/story-0.3-implementation-summary.md` (new)
- `docs/api/authentication.md` (new)

**Acceptance Criteria:**
- [x] Integration tests cover happy path
- [x] Integration tests cover error cases
- [x] API documentation complete
- [x] Implementation summary written

### Timeline
- **Day 1:** Part 1 submitted (UI foundation)
- **Day 2:** Part 1 reviewed & merged
- **Day 3:** Part 2 submitted (OAuth integration)
- **Day 4:** Part 2 reviewed & merged
- **Day 5:** Part 3 submitted (tests & docs)
- **Day 6:** Part 3 reviewed & merged, story marked DONE

**Result:** 1,200 lines shipped in 3 reviewable PRs over 6 days.

## Quick Reference Commands

```bash
# 1. Start story
git checkout main && git pull
git checkout -b story/4.1-daily-reflection

# 2. Implement Part 1, check lines
git diff --stat

# 3. Create sub-branch for Part 1
git checkout -b story/4.1-daily-reflection/part-1-ui
git add <files> && git commit -m "feat(4.1): part 1 - UI"
git push -u origin story/4.1-daily-reflection/part-1-ui

# 4. Create PR
gh pr create --base main

# 5. Return to parent for Part 2
git checkout story/4.1-daily-reflection

# 6. After Part 1 merges, update parent
git checkout story/4.1-daily-reflection
git merge main

# 7. Create Part 2 sub-branch
git checkout -b story/4.1-daily-reflection/part-2-api
# ... repeat process ...
```

## Summary

| Concept | Key Point |
|---------|-----------|
| **Max PR size** | 800 lines (ideal: 200-400) |
| **When to split** | Story > 600 lines |
| **How to split** | Foundation → Core → Tests |
| **Branch pattern** | `story/X.Y/part-N-description` |
| **Merge strategy** | Sequential (Part 1 → 2 → 3) |
| **Story completion** | After all parts merged + acceptance criteria met |

**Remember:** Split PRs are about **reviewability**, not bureaucracy. If your story is 500 lines and tightly coupled, submit one PR. If it's 1,500 lines with clear boundaries, split into 3 parts.

---

**Related Docs:**
- `CLAUDE.md` (Pull request guidelines)
- `docs/dev/git-workflow-guide.md` (Branching strategy)
- `docs/stories/` (Story specifications)
