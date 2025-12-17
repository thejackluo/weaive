# BMAD Implementation Guide (Non-Technical)

**Last Updated:** 2025-12-17

## What is This Guide?

This guide explains how to build the Weave app using the BMAD methodology. Think of BMAD as a structured recipe for building software with AI assistants. Just like a recipe has steps you follow in order, BMAD has workflows (processes) that help you build features one piece at a time.

---

## The Big Picture: How BMAD Works

Imagine building a house. You don't just start hammering nails randomly. You:
1. **Plan** what the house should look like (blueprints)
2. **Design** the structure and choose materials (architecture)
3. **Build** it room by room (implementation)
4. **Inspect** each room before moving to the next (quality checks)

BMAD works the same way for software.

### The Four Phases

```
Phase 1: Analysis (Discovery)
   ↓ "What problem are we solving?"

Phase 2: Planning (Requirements)
   ↓ "What features do we need?"

Phase 3: Solutioning (Architecture)
   ↓ "How will we build it?"

Phase 4: Implementation (Building) ← YOU ARE HERE
   ↓ "Let's build it, one piece at a time"
```

**You've already completed Phases 1-3!** All the planning documents are ready:
- Product requirements (what to build)
- Architecture decisions (how to build it)
- Epic and story breakdown (step-by-step tasks)

Now you're in **Phase 4: Implementation** - the actual building phase.

---

## Understanding the Building Blocks

### What is an Epic?

An **Epic** is a large feature area. Think of it as a chapter in a book.

**Examples from Weave:**
- Epic 1: Onboarding & Identity (how users get started)
- Epic 2: Goal Management (creating and managing goals)
- Epic 3: Daily Actions (completing tasks daily)

**Analogy:** If you're building a house, one epic might be "Kitchen," another might be "Bathroom."

### What is a Story?

A **Story** is a small, specific task within an epic. Think of it as a paragraph in a chapter.

**Examples from Epic 1:**
- Story 1.1: Welcome Screen (show logo and "Get Started" button)
- Story 1.2: Demographics Collection (ask for timezone and preferences)
- Story 1.3: Archetype Assessment (personality quiz)

**Analogy:** In the "Kitchen" epic, one story might be "Install the sink," another might be "Install the oven."

### The Golden Rule: One Story at a Time

**CRITICAL PRINCIPLE:** Complete one story fully before starting the next.

Why? Because:
- You stay focused and don't get overwhelmed
- Quality checks happen at each step
- If something goes wrong, it's easier to fix
- You can measure progress clearly

---

## The Implementation Workflow (Step-by-Step)

### Phase 4 Overview

```
Week 0: Foundation Setup (3-5 days)
   ↓
Sprint 1: Core Features (2 weeks)
   ↓
Sprint 2: AI Features (2 weeks)
   ↓
Sprint 3+: Advanced Features
```

You're currently preparing for **Week 0: Foundation**.

---

## How to Execute Stories (The Daily Workflow)

### The Story Lifecycle

Every story goes through 4 states:

```
1. TODO
   ↓ (create the story)

2. IN PROGRESS
   ↓ (build it)

3. READY FOR REVIEW
   ↓ (quality check)

4. DONE ✅
```

### Step-by-Step: Executing One Story

Here's what happens when you execute a story:

#### **Step 1: Check What's Next**

Run the workflow status checker to see what story to work on next.

**What you do:**
```
Ask Claude: "What should I work on next?"
OR
Run: /bmad:bmm:workflows:sprint-status
```

**What you get:**
```
Current Epic: Epic 0 - Foundation
Current Story: Story 0.1 - Mobile & Backend Initialization
Status: TODO
Next Step: Run create-story
```

---

#### **Step 2: Create the Story (SM Agent)**

The **Scrum Master (SM)** agent creates a detailed implementation plan for the story.

**What you do:**
```
Run: /bmad:bmm:workflows:create-story
```

**What happens:**
- SM reads the epic backlog
- Finds the next story that's marked "TODO"
- Creates a detailed file with:
  - What needs to be built
  - Acceptance criteria (how to know it's done)
  - Technical details
  - Dependencies (what must exist first)

**What you get:**
A file like: `docs/stories/epic-0/story-0.1-mobile-backend-init.md`

**Story status changes:** TODO → **IN PROGRESS**

---

#### **Step 3: Build the Story (DEV Agent)**

The **Developer (DEV)** agent writes the actual code.

**What you do:**
```
Run: /bmad:bmm:workflows:dev-story
```

**What happens:**
- DEV reads the story file
- Writes code to implement the feature
- Writes tests to verify it works
- Runs the tests to confirm everything passes
- Updates the story file with what was done

**What you get:**
- New code files created
- Tests written and passing
- Story marked as complete

**Story status changes:** IN PROGRESS → **READY FOR REVIEW**

**Time estimate:** 30 minutes to 2 hours (depending on story complexity)

---

#### **Step 4: Review the Story (Code Review)**

The **Senior Developer** reviews the code for quality.

**What you do:**
```
Run: /bmad:bmm:workflows:code-review
```

**What happens:**
- DEV acts as a senior developer
- Reviews the code for:
  - Bugs or errors
  - Security issues
  - Code quality
  - Best practices
  - Missing tests
- Finds 3-10 specific issues (adversarial review - ALWAYS finds something)

**Two possible outcomes:**

**Outcome A: Issues Found**
```
Status: CHANGES REQUESTED
Action: Fix the issues and return to Step 3
```

**Outcome B: Passes Review**
```
Status: APPROVED
Story status changes: READY FOR REVIEW → DONE ✅
```

**Time estimate:** 10-30 minutes

---

#### **Step 5: Move to Next Story**

Once a story is **DONE**, return to **Step 1** and repeat for the next story.

---

### Complete Story Execution Example

Let's walk through Story 0.1: "Mobile & Backend Initialization"

**Morning (9:00 AM):**
```
You: "What should I work on next?"
Claude: "Story 0.1: Mobile & Backend Initialization is ready. Run create-story."
```

**Morning (9:05 AM):**
```
You: /bmad:bmm:workflows:create-story
Claude (SM): "Story created! Here's what needs to be built:
  1. Initialize Expo mobile app
  2. Initialize FastAPI backend
  3. Verify both run locally
  Story file: docs/stories/epic-0/story-0.1-mobile-backend-init.md"
```

**Morning (9:10 AM - 11:00 AM):**
```
You: /bmad:bmm:workflows:dev-story
Claude (DEV): "Building the story..."
  - Creates mobile/ directory with Expo app
  - Creates api/ directory with FastAPI backend
  - Writes setup scripts
  - Writes tests
  - Runs tests ✅
Claude (DEV): "Story complete! Both apps run successfully."
```

**Morning (11:05 AM):**
```
You: /bmad:bmm:workflows:code-review
Claude (Senior DEV): "Reviewing code... Found 5 issues:
  1. Missing error handling in setup script
  2. No .gitignore file for node_modules
  3. API port hardcoded (should be configurable)
  4. No README for running the apps
  5. Missing TypeScript strict mode config
Status: CHANGES REQUESTED"
```

**Lunch Break**

**Afternoon (1:00 PM - 2:00 PM):**
```
You: /bmad:bmm:workflows:dev-story
Claude (DEV): "Fixing review issues..."
  - Adds error handling
  - Creates .gitignore
  - Adds port configuration
  - Writes README files
  - Enables TypeScript strict mode
  - Re-runs tests ✅
Claude (DEV): "Fixes complete!"
```

**Afternoon (2:05 PM):**
```
You: /bmad:bmm:workflows:code-review
Claude (Senior DEV): "Reviewing code... All issues resolved!
Status: APPROVED ✅
Story 0.1 marked DONE."
```

**Afternoon (2:10 PM):**
```
You: "What's next?"
Claude: "Story 0.2: Database Schema is ready. Run create-story."
```

And the cycle repeats!

---

## Week 0: Foundation (Your First 5 Days)

### Overview

Week 0 is like building the foundation of a house before adding rooms. You're setting up:
- Mobile app framework
- Backend API framework
- Database structure
- Authentication system
- Basic security

### Week 0 Stories (Epic 0)

| Day | Stories | What Gets Built |
|-----|---------|----------------|
| **Day 1-2** | 0.1, 0.2a, 0.2b | Project setup + Database tables |
| **Day 2-3** | 0.3, 0.4 | Login system + Security rules |
| **Day 3-4** | 0.5, 0.6, 0.7 | Deployment pipeline + AI setup + Tests |
| **Day 4-5** | 0.8, 0.9, 0.10 | Error handling everywhere |

**Total:** 10 stories, 38 story points (~3-5 days)

### Week 0 Success Criteria

By the end of Week 0, you should have:

✅ **Mobile app runs on your phone/simulator**
- You can open the app and see a blank screen (no crashes)

✅ **Backend API responds to requests**
- You can visit http://localhost:8000 and see the API

✅ **Database has 8 core tables**
- User profiles, goals, subtasks, completions, etc.

✅ **You can sign up, log in, log out**
- Create a test account and authenticate

✅ **Security rules prevent data leaks**
- Users can only see their own data

✅ **Tests pass**
- Automated tests verify everything works

**If all checkboxes are ✅, Week 0 is complete!**

---

## Sprint 1: Core User Journey (Week 1-2)

After Week 0, you move to Sprint 1, which builds the core experience:

### What Gets Built

**Sprint 1 Goal:** A user can:
1. Complete onboarding (< 5 minutes)
2. Set their first goal (Needle)
3. Complete their first daily action (Bind)
4. See their progress on a dashboard

### Sprint 1 Stories (Simplified)

**Epic 1: Onboarding (7 stories)**
- Welcome screen
- Demographics questions
- Personality quiz
- Dream self definition
- First goal creation
- Commitment moment

**Epic 3: Daily Actions (4 stories)**
- View today's tasks
- Complete a task
- Attach proof (photo)
- Add a quick note

**Epic 5: Progress Dashboard (2 stories)**
- Basic dashboard with stats
- Streak counter

**Total:** 13 stories, 48 story points (2 weeks)

---

## Tools and Commands Reference

### Key Slash Commands

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/bmad:bmm:workflows:sprint-status` | Shows what to work on next | Every morning, after completing a story |
| `/bmad:bmm:workflows:create-story` | Creates the next story plan | When status says "TODO" |
| `/bmad:bmm:workflows:dev-story` | Builds the story | After create-story |
| `/bmad:bmm:workflows:code-review` | Reviews code quality | After dev-story |
| `/bmad:bmm:workflows:retrospective` | Reviews completed epic | After finishing all stories in an epic |

### Key Files

| File | Purpose | When to Check |
|------|---------|---------------|
| `docs/bmm-workflow-status.yaml` | Overall project phase status | Rarely (you're in Phase 4 now) |
| `docs/sprint-plan.md` | Complete sprint roadmap | Weekly planning |
| `docs/epics.md` | All epics and stories | When starting a new epic |
| `docs/stories/epic-X/story-X.X-name.md` | Individual story details | During implementation |

---

## Common Questions

### Q: How long does one story take?

**A:** Anywhere from 30 minutes to 4 hours, depending on complexity.

**Simple stories (1-3 points):** 30 min - 1 hour
- Example: "Add a welcome screen with logo"

**Medium stories (3-5 points):** 1-2 hours
- Example: "Build personality quiz with 8 questions"

**Complex stories (5-8 points):** 2-4 hours
- Example: "Implement AI goal breakdown with probing questions"

### Q: What if I get stuck on a story?

**A:** Run the "correct-course" workflow:

```
/bmad:bmm:workflows:correct-course
```

This analyzes the issue and suggests:
- Breaking the story into smaller pieces
- Skipping to a different story temporarily
- Getting help with specific blockers

### Q: Can I work on multiple stories at once?

**A:** **No.** Always complete one story fully (through code review) before starting the next.

Why?
- Prevents overwhelming complexity
- Ensures quality at each step
- Makes debugging easier
- Tracks progress clearly

### Q: What if code review keeps finding issues?

**A:** That's normal! Code review is intentionally strict (adversarial).

**Process:**
1. Review finds issues → Status: CHANGES REQUESTED
2. Run dev-story again to fix issues
3. Run code-review again
4. Repeat until review passes

**Usually takes 1-2 rounds to pass.**

### Q: How do I know I'm making progress?

**A:** Check the sprint status file:

```
docs/sprint-status.yaml
```

This shows:
- Stories completed: 3/38 ✅
- Current epic: Epic 0 - Foundation
- Current story: Story 0.4 - Row Level Security
- Days remaining in sprint: 12 days

---

## Tips for Success

### 1. Start Every Day with Status Check

```
Morning routine:
1. Open Claude
2. Ask: "What should I work on today?"
3. Run the suggested workflow
```

### 2. One Story at a Time

Don't jump ahead. Complete each story fully:
- Create story
- Build story
- Review story
- Mark done

Then move to the next one.

### 3. Trust the Process

The workflows are designed to keep you on track. If a workflow suggests something, there's a reason.

### 4. Celebrate Small Wins

Every story completed is progress! 38 stories might seem like a lot, but:
- Week 0: 10 stories
- Sprint 1: 13 stories
- Sprint 2: 14 stories

One story at a time, you'll get there.

### 5. Use the Retrospective

After completing each epic, run:
```
/bmad:bmm:workflows:retrospective
```

This helps you:
- Reflect on what went well
- Identify what was difficult
- Improve your process

---

## Week 0 Day-by-Day Plan

### Day 1: Project Initialization

**Morning:**
- Run sprint-status
- Create Story 0.1
- Build Story 0.1 (Mobile & Backend setup)
- Review Story 0.1
- Mark done ✅

**Afternoon:**
- Create Story 0.2a
- Build Story 0.2a (Database core tables)
- Review Story 0.2a
- Mark done ✅

**End of day:** 2 stories complete, apps running locally

---

### Day 2: Database & Authentication

**Morning:**
- Create Story 0.2b
- Build Story 0.2b (Schema refinement)
- Review Story 0.2b
- Mark done ✅

**Afternoon:**
- Create Story 0.3
- Build Story 0.3 (Authentication flow)
- Review Story 0.3
- Mark done ✅

**End of day:** 4 stories complete, users can log in

---

### Day 3: Security & Infrastructure

**Morning:**
- Create Story 0.4
- Build Story 0.4 (Row Level Security - CRITICAL)
- Review Story 0.4
- Mark done ✅

**Afternoon:**
- Create Story 0.5
- Build Story 0.5 (CI/CD pipeline)
- Review Story 0.5
- Mark done ✅

**End of day:** 6 stories complete, app is secure

---

### Day 4: AI & Testing

**Morning:**
- Create Story 0.6
- Build Story 0.6 (AI service abstraction)
- Review Story 0.6
- Mark done ✅

**Afternoon:**
- Create Story 0.7
- Build Story 0.7 (Test infrastructure)
- Review Story 0.7
- Mark done ✅

**End of day:** 8 stories complete, AI ready

---

### Day 5: Error Handling

**Morning:**
- Create Story 0.8
- Build Story 0.8 (Error handling framework)
- Review Story 0.8
- Mark done ✅

**Afternoon:**
- Create Story 0.9
- Build Story 0.9 (Image upload errors)
- Create Story 0.10
- Build Story 0.10 (AI failure handling)
- Review Stories 0.9 & 0.10
- Mark done ✅✅

**End of day:** 10 stories complete, Week 0 DONE! 🎉

---

## Success Metrics

### Week 0 Success

At the end of Week 0, verify:

**Technical Checklist:**
- [ ] Mobile app runs on iOS simulator
- [ ] Backend API runs on http://localhost:8000
- [ ] Database has 8 tables with data
- [ ] You can create a user account
- [ ] You can log in and log out
- [ ] Tests pass when you run them
- [ ] No security vulnerabilities in RLS

**Delivery Checklist:**
- [ ] All 10 stories marked DONE
- [ ] Code review passed for each story
- [ ] Zero critical bugs
- [ ] Documentation updated

**If all boxes checked → Week 0 complete! Move to Sprint 1.**

---

## What Happens After Implementation?

After you complete all sprints (Week 0 + Sprints 1-5), you move to:

### Sprint 6: Alpha Testing

- Release to 10-20 real users
- Collect feedback
- Fix critical bugs
- Prepare for beta launch

**Success criteria:**
- <1% crash rate
- 7-day retention >40%
- AI costs <$0.50/user/month

---

## Getting Help

### When to Ask for Help

**Story level:** Run correct-course workflow
**Epic level:** Run retrospective, then correct-course if needed
**Sprint level:** Review sprint-plan.md and adjust scope

### What to Ask Claude

**Good questions:**
- "What should I work on next?"
- "What does Story 0.3 require?"
- "Show me the code review feedback"
- "How many stories are left in this epic?"

**Avoid asking:**
- "Build everything at once" (one story at a time!)
- "Skip the code review" (quality gates are required)
- "What's the fastest way?" (process ensures quality)

---

## Summary: The Daily Rhythm

```
Every day:
1. Check sprint status (What's next?)
2. Create story (SM: What needs to be built?)
3. Build story (DEV: Write the code)
4. Review story (DEV: Check quality)
5. Mark done ✅
6. Repeat for next story

Every epic:
- Run retrospective
- Celebrate wins
- Learn lessons

Every sprint:
- Review sprint plan
- Adjust if needed
- Track velocity
```

---

## Appendix: Story Point Estimates

**What is a story point?**

A story point measures complexity and effort, not time.

| Points | Complexity | Example | Typical Time |
|--------|------------|---------|--------------|
| 1 | Trivial | Add a text label | 15-30 min |
| 2 | Simple | Create a basic screen | 30-60 min |
| 3 | Medium | Add a form with validation | 1-2 hours |
| 5 | Complex | Implement authentication | 2-4 hours |
| 8 | Very Complex | Build AI goal breakdown | 4-8 hours |

**Velocity:** How many story points you complete per day.

- Beginner: ~3-5 points/day
- Intermediate: ~5-8 points/day
- Expert: ~8-10 points/day

**Week 0 (38 points) ÷ 5 days = ~8 points/day target**

---

**End of Guide**

**Next Steps:**
1. Read the sprint plan: `docs/sprint-plan.md`
2. Check workflow status: Ask Claude "What should I work on?"
3. Start Week 0: Run create-story for Story 0.1
4. Build one story at a time
5. Celebrate every DONE ✅

You've got this! 🚀
