# Sprint Artifacts

This directory contains implementation session notes, code reviews, and change proposals from sprint execution.

## Directory Structure

```
docs/sprint-artifacts/
├── README.md                                # This file
│
├── sprint-change-proposals/                 # Scope changes and pivots
│   ├── sprint-change-proposal-general-2025-12-18.md
│   ├── sprint-change-proposal-general-2025-12-21.md
│   ├── sprint-change-proposal-navigation-scaffolding-2025-12-21.md
│   ├── sprint-change-proposal-story-1.4-2025-12-18.md
│   └── sprint-change-proposal-story-1.7-2025-12-18.md
│
├── epic-retrospectives/                     # Post-epic learnings
│   └── epic-0-retrospective-2025-12-20.md
│
├── design-system-old/                       # Archived design system docs
│   ├── design-system-comprehensive-spec.md
│   ├── design-system-foundation-react-native-2025-12-18.md
│   └── design-system-implementation-summary.md
│
└── [Story Implementation Files]             # Active story artifacts (root level)
    ├── story-{X.X}-*.md
    ├── CHECKPOINT-*.md
    └── 4-1-daily-reflection-entry.md
```

## File Types

### Sprint Change Proposals (`sprint-change-proposals/`)
**Format:**
- `sprint-change-proposal-story-{X.X}-{YYYY-MM-DD}.md` (story-specific)
- `sprint-change-proposal-{topic}-{YYYY-MM-DD}.md` (general)

**Purpose:** Document scope changes, pivots, or significant deviations during sprint
**Contains:**
- Original plan vs. actual changes
- Rationale for the change
- Impact on timeline and dependencies
- Updated acceptance criteria

**When to create:** When a story requires significant scope adjustment mid-sprint

### Epic Retrospectives (`epic-retrospectives/`)
**Format:** `epic-{X}-retrospective-{YYYY-MM-DD}.md`
**Purpose:** Post-epic learnings and insights
**Contains:**
- What went well / what didn't
- Key technical decisions and their outcomes
- Process improvements for next epic
- Discovered requirements or tech debt

**When to create:** After completing all stories in an epic

### Story Implementation Files (Root Level)
**Formats:**
- `story-{X.X}-implementation-artifacts.md` - Implementation notes
- `story-{X.X}-implementation-checklist.md` - Pre/post-implementation tasks
- `story-{X.X}-completion-summary.md` - Final summary and outcomes
- `story-{X.X}-backend-integration.md` - Backend-specific notes
- `story-{X.X}-code-review-summary.md` - Code review findings

**Purpose:** Track implementation details, decisions, and outcomes per story
**When to create:** During or immediately after story implementation

### Design System (Archived) (`design-system-old/`)
**Purpose:** Historical design system documentation (no longer actively maintained)
**Note:** Current design system docs are in `docs/dev/design-system-guide.md`

## Naming Conventions

### Story Files
- Use dot notation: `story-1.7-*.md`, `story-2.1-*.md`
- Always prefix with "story-" for clarity
- Use descriptive suffixes: `-completion-summary`, `-implementation-artifacts`, etc.

### Change Proposals
- Format: `sprint-change-proposal-{scope}-{YYYY-MM-DD}.md`
- Scope options:
  - `story-X.X` (story-specific changes)
  - `general` (broad scope changes)
  - `{topic}` (specific topic like "navigation-scaffolding")

### Retrospectives
- Format: `epic-{X}-retrospective-{YYYY-MM-DD}.md`
- Use integer epic numbers (0, 1, 2...)

## Workflow

### During Story Implementation
1. Create `story-{X.X}-implementation-artifacts.md` at story start
2. Document key decisions and blockers in real-time
3. If scope changes significantly → Create sprint change proposal
4. Complete story → Create `story-{X.X}-completion-summary.md`

### After Epic Completion
1. Review all story completion summaries
2. Create epic retrospective
3. Archive outdated documentation to appropriate folders

## Related Directories

- `docs/testing/atdd/` - ATDD checklists per story
- `docs/stories/` - Original story specifications
- `docs/stories/validation-reports/` - Post-implementation validation
- `.cursor/.cursor-changes` - Changelog for significant changes
