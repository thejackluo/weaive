# Testing Documentation

This directory contains all testing-related documentation for the Weave project.

## Directory Structure

```
docs/testing/
├── README.md                           # This file
├── test-design.md                      # Overall testing strategy and principles
├── voice-demo-quick-start.md           # Quick start guide for voice/STT testing (Story 0.11)
├── voice-stt-manual-testing-guide.md   # Comprehensive voice/STT manual testing (Story 0.11)
├── atdd/                               # Story-level ATDD checklists
│   ├── atdd-checklist-story-1.6.md
│   ├── atdd-checklist-story-1.7.md
│   ├── atdd-checklist-story-2.1.md
│   └── atdd-checklist-story-4.1.md
└── epic/                               # Epic-level test design documents
    ├── test-design-epic-0.md
    ├── test-design-epic-1.md
    └── test-design-epic-4.md
```

## File Types

### Manual Testing Guides
**Format:** `{feature}-{test-type}.md`
**Purpose:** Interactive testing guides for manual QA and feature verification
**Contains:**
- Quick start guides (5-10 minutes)
- Comprehensive test scenarios
- Prerequisites and setup instructions
- Troubleshooting tips

**Current Guides:**
- **voice-demo-quick-start.md** - 5-minute voice/STT verification
- **voice-stt-manual-testing-guide.md** - Full voice/STT test suite (25+ scenarios)

**When to use:** During feature development and before release to manually verify functionality

### ATDD Checklists (`atdd/`)
**Format:** `atdd-checklist-story-{X.X}.md`
**Purpose:** Acceptance Test-Driven Development checklists for individual stories
**Contains:**
- Story acceptance criteria
- Test scenarios and edge cases
- Implementation validation checklist
- Test coverage requirements

**When to use:** During story implementation to ensure all acceptance criteria are met

### Epic Test Design (`epic/`)
**Format:** `test-design-epic-{X}.md`
**Purpose:** Strategic test plans spanning multiple stories within an epic
**Contains:**
- Epic-wide testing strategy
- Cross-story integration tests
- Performance benchmarks
- Security testing requirements

**When to use:** At the start of an epic to plan comprehensive testing approach

### Overall Test Design (`test-design.md`)
**Purpose:** Project-wide testing philosophy and standards
**Contains:**
- Testing methodology (TDD, BDD, ATDD)
- Test automation strategy
- CI/CD testing integration
- Quality gates and metrics

**When to use:** When establishing testing standards or onboarding new team members

## Naming Conventions

- **Stories:** Use dot notation (e.g., `1.6`, `2.1`)
- **Epics:** Use integer notation (e.g., `0`, `1`, `4`)
- **Always include "story" or "epic" prefix** for clarity

## Related Directories

- `docs/stories/validation-reports/` - Post-implementation validation results
- `weave-api/tests/` - Backend test implementations
- `weave-mobile/src/**/__tests__/` - Frontend test implementations
