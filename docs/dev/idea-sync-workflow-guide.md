# Idea-to-Documentation Sync Workflow Guide

**Purpose:** Developer reference for understanding and using the idea-to-docs sync workflow
**Last Updated:** 2025-12-17
**Workflow Location:** `.bmad/bmm/workflows/sync-ideas-to-docs-restructured/`

---

## Overview

This workflow ensures that design exploration and ideas in `docs/idea/` are systematically reviewed and propagated to official strategic documentation (`docs/`) and implementation artifacts (`.bmad/bmm/`).

### Documentation Hierarchy

```
docs/idea/           →  docs/           →  .bmad/bmm/     →  Implementation
(Exploration)           (Strategy)          (Execution)        (Code)

mvp.md               →  prd.md          →  epics/         →  weave-api/
backend.md           →  architecture.md →  stories/       →  weave-mobile/
ai.md                →  product-        →  sprint-status. →  tests/
ux.md                   roadmap.md         yaml
```

### Why This Workflow Exists

**Problem:** Design changes happen in exploration files (`docs/idea/`) but often aren't systematically propagated to official docs and implementation plans, causing drift and confusion.

**Solution:** A structured BMAD workflow that:
1. Scans for changes in `docs/idea/`
2. Analyzes impact on official docs and implementation
3. Executes approved updates with proper phasing tags
4. Commits changes with clear git messages
5. Maintains sync metadata for tracking

---

## When to Run This Workflow

### Automatic Triggers (Future)

**Every Monday at 9:00 AM:**
- Scan `docs/idea/` for changes since last sync
- Generate sync report with proposed updates
- Create GitHub issue or Slack notification for review

### Manual Triggers (Current)

Run this workflow when:

1. **Major design updates** - Significant UX/UI changes in `docs/idea/ux.md`
2. **Feature additions** - New features added to `docs/idea/mvp.md`
3. **Architecture changes** - Backend or AI system updates
4. **Before sprint planning** - Ensure all docs are in sync before creating stories
5. **After design reviews** - When team agrees on new design direction

### Command to Run

```bash
# Via Claude Code (if BMAD workflows are integrated)
/bmad:bmm:workflows:sync-ideas-to-docs

# Or manually invoke workflow.md
```

---

## Workflow Steps (High-Level)

| Step | Name | Purpose | Key Outputs |
|------|------|---------|-------------|
| **1** | Initialize | Detect fresh/resume mode, set last sync date | State file, output log |
| **2** | Scan Changes | Find what changed in `docs/idea/` since last sync | Change summary report |
| **3** | Impact Analysis | Map changes to affected docs/stories using phasing rules | Impact analysis report |
| **4** | Propagate Updates | Execute approved file updates | Modified documentation files |
| **5** | Review & Commit | Validate changes and commit to git | Git commit, updated metadata |

---

## Phasing System

The workflow uses phasing tags to determine urgency and scope of documentation updates:

| Phasing Tag | Meaning | Documentation Strategy |
|-------------|---------|------------------------|
| **[MVP]** | Must ship in MVP | Update ALL docs immediately (prd, architecture, epics, sprint status) |
| **[v1.1]** | First post-MVP release | Update strategic docs (roadmap, prd), TAG stories in epics, defer implementation |
| **[v1.2]** | Second post-MVP release | Update roadmap only, no epic/story changes yet |
| **No tag** | Future exploration | Optional roadmap entry, no other updates |

### Decision Matrix Example

**Change:** "Add calendar component to home screen" tagged **[v1.1]**

**Impact Analysis:**
- ✅ Update `docs/product-roadmap.md` → Add to v1.1 features section
- ✅ Update `docs/epics.md` → Tag Story 3.1 and 5.1 with `[v1.1]`, update ACs
- ⏳ Update `docs/sprint-status.yaml` → Not yet (wait until v1.1 sprint)
- ⚠️ Update `docs/architecture.md` → Optional (if technical changes needed)

---

## File Structure

```
.bmad/bmm/workflows/sync-ideas-to-docs-restructured/
├── workflow.md              # Entry point, metadata, agent assignments
├── steps/
│   ├── step-01-init.md     # Initialize or resume workflow
│   ├── step-02-scan.md     # Scan docs/idea/ for changes
│   ├── step-03-impact.md   # Analyze impact on official docs
│   ├── step-04-propagate.md # Execute approved updates
│   └── step-05-review.md   # Review and commit changes
└── data/ (future)
    ├── phasing-rules.csv   # Feature keyword → phase mapping
    └── doc-impact-matrix.csv # Change type → affected docs

.bmad/bmm/logs/
├── idea-sync-state.json    # Workflow state (resumable)
└── idea-sync-log.md        # Historical sync log
```

---

## State Management

The workflow uses **two key files** for state tracking:

### 1. State File (`.bmad/bmm/logs/idea-sync-state.json`)

**Purpose:** Track workflow progress, enable resumption if interrupted

**Key Fields:**
- `workflow_mode`: "fresh" | "resume"
- `steps_completed`: Array of completed step IDs
- `current_step`: Where to resume from
- `findings`: Scan results, impact analysis summaries
- `modified_files`: List of files actually changed
- `status`: "in_progress" | "completed"

**Example:**
```json
{
  "workflow_id": "sync-ideas-to-docs",
  "workflow_version": "2.0.0",
  "timestamps": {
    "started": "2025-12-17T10:00:00Z",
    "last_updated": "2025-12-17T10:30:00Z"
  },
  "workflow_mode": "fresh",
  "steps_completed": ["step-01-init", "step-02-scan"],
  "current_step": "step-03-impact",
  "status": "in_progress",
  "findings": {
    "scan_summary": {
      "modified_files": 2,
      "ux_changes": 7,
      "needs_phasing": 0
    }
  }
}
```

### 2. Output Log (`.bmad/bmm/logs/idea-sync-log.md`)

**Purpose:** Human-readable record of workflow execution and decisions

**Contents:**
- Workflow progress checklist
- Change summary report (from Step 2)
- Impact analysis report (from Step 3)
- Update summary (from Step 4)
- Final commit information (from Step 5)

---

## Typical Workflow Execution

### Scenario: v2 UX Design Changes (Real Example from 2025-12-17)

**Context:** 7 design changes added to `docs/idea/ux.md`, all tagged `[v1.1]`

#### Step 1: Initialize

- Workflow mode: Fresh (no previous state)
- Trigger reason: Design update
- Last sync date: 2025-12-10 (extracted from ux.md frontmatter)
- Output: State file created

#### Step 2: Scan Changes

- Git diff finds: `docs/idea/ux.md` modified
- Extracts 7 changes from Design Changelog section
- Phasing check: All 7 have `[v1.1]` tags ✓
- Output: Change summary report

#### Step 3: Impact Analysis

- Apply decision matrix: v1.1 features require roadmap + epic tags
- Map changes to affected stories:
  - Calendar component → Story 3.1, 5.1
  - Streak recovery → Story 5.5
  - Navigation changes → Story 6.1
  - (etc., 8 total stories affected)
- Output: Impact analysis report with specific AC updates needed

#### Step 4: Propagate Updates

User approves updates, workflow executes:
1. Update `docs/product-roadmap.md` → Add v1.1 section with 7 features
2. Update `docs/idea/ux.md` → Confirm all phasing tags present
3. Update `docs/epics.md` → Tag 8 stories with `[v1.1]`, update ACs
4. Output: 3 files modified

#### Step 5: Review & Commit

- Show git diff for all 3 files
- Run validation checklist (all ✓)
- Draft commit message:
  ```
  docs: sync v2 design changes from idea/ to official docs

  - Update product-roadmap.md with 7 v1.1 features
  - Confirm phasing tags in ux.md Design Changelog
  - Tag 8 affected stories in epics.md with [v1.1]
  - Update acceptance criteria for UX changes

  Ref: docs/idea/ux.md v2 changelog (2025-12-17)
  ```
- Execute: `git add` + `git commit`
- Update frontmatter in ux.md: `last_synced_to_official_docs: 2025-12-17`
- Output: Commit hash, completion summary

**Result:** ✓ All docs in sync, changes tracked, ready for implementation

---

## Best Practices

### ✅ DO:

1. **Always use phasing tags** in Design Changelog before running workflow
2. **Review impact analysis carefully** before approving updates
3. **Check git diff** before committing to catch unintended changes
4. **Run workflow weekly** (or after major design sessions) to prevent drift
5. **Use Party Mode** (`[P]` menu option) when uncertain about impact decisions
6. **Keep "Last Synced" timestamps** up to date in idea/ files
7. **Write clear commit messages** referencing source docs

### ❌ DON'T:

1. **Don't propagate future ideas** ([v1.2+]) to epic stories yet
2. **Don't skip impact analysis** even if changes seem minor
3. **Don't update code directly** from idea/ files (go through epics first)
4. **Don't mix MVP and v1.1 changes** in same story without clear phasing
5. **Don't defer syncing for more than 2 weeks** (creates drift)
6. **Don't commit without review** (Step 5 validation checklist)
7. **Don't push to remote** without team awareness (workflow only commits locally)

---

## Resuming Interrupted Workflows

If the workflow is interrupted (AI crashed, user stopped, etc.):

1. **Check state file:** `.bmad/bmm/logs/idea-sync-state.json`
2. **Look for:** `"status": "in_progress"` and `"current_step": "step-X"`
3. **Re-run workflow:** It will detect incomplete state and offer to resume
4. **Select option 1:** "Resume from step-X"
5. **Continue:** Workflow loads from last checkpoint

**What's preserved:**
- All scan results and impact analysis
- Files already modified in previous steps
- Menu selections and user input

**What's NOT preserved:**
- In-memory data (must reload from state file)
- Uncommitted git changes (if Step 5 wasn't reached)

---

## Troubleshooting

### Issue: "No changes detected in docs/idea/"

**Cause:** No git commits to idea/ folder since last sync date

**Solution:**
- Select option 2: "Force full rescan" to check all files regardless
- Or commit your idea/ changes first, then re-run workflow

### Issue: "State file corrupt or incomplete"

**Cause:** State file was manually edited or workflow crashed mid-write

**Solution:**
- Workflow offers repair from output log (option 1)
- Or start fresh (option 2)
- Or manually fix JSON in state file (advanced)

### Issue: "Unmarked changes need phasing tags"

**Cause:** Design changes in ux.md don't have [MVP], [v1.1], or [v1.2] tags

**Solution:**
- Manually add phasing tags to `docs/idea/ux.md` Design Changelog
- Re-run Step 2 scan to detect tags
- Or use Step 3 menu option [E] to add tags during workflow

### Issue: "Unexpected files in git status"

**Cause:** Files modified outside the workflow are showing as changed

**Solution:**
- Review unexpected files (workflow will prompt)
- Commit or stash unrelated changes before sync
- Or proceed carefully, ensuring only sync-related changes are committed

---

## Frequency Recommendations

| Scenario | Recommended Frequency |
|----------|----------------------|
| **Active development (pre-MVP)** | Weekly or after every major design session |
| **Sprint planning week** | Before every sprint planning (ensure alignment) |
| **Post-MVP (stable)** | Bi-weekly or monthly |
| **Major feature additions** | Immediately after design approval |

---

## Integration with Other Workflows

### Related BMAD Workflows

- `/bmad:bmm:workflows:create-prd` - Creates PRD from product brief
- `/bmad:bmm:workflows:create-architecture` - Creates architecture from PRD
- `/bmad:bmm:workflows:create-epics-stories` - Creates epics/stories from PRD + architecture
- `/bmad:core:workflows:party-mode` - Multi-agent review for validation

### Typical Workflow Sequence

```
1. Explore ideas in docs/idea/          (Freeform thinking)
2. Run idea-sync-workflow                (This workflow)
3. Run create-epics-stories              (Generate implementation tasks)
4. Run sprint-planning                   (Allocate work)
5. Implement features                    (Code)
6. Repeat cycle                          (Continuous improvement)
```

---

## Future Enhancements

### Semi-Automated Workflow (v2)

1. Git hook detects changes in `docs/idea/`
2. Script generates change summary report
3. Human reviews and approves propagation
4. Script updates phasing tags and roadmap
5. Human reviews ACs and commits

### Fully Automated Workflow (v3)

1. AI agent scans idea/ changes
2. AI agent generates impact analysis
3. AI agent drafts update PR with all changes
4. Human reviews and approves PR
5. Auto-merge on approval

---

## Questions & Support

### Q: What if I'm not sure which phase a feature belongs to?

**A:** Default to next phase (v1.1 if MVP done, v1.2 if v1.1 done). Use Party Mode (`[P]` in menu) to discuss with multiple BMAD agents for consensus.

### Q: What if a feature spans multiple phases?

**A:** Break it into sub-features and tag each part separately.

**Example:**
- "Calendar - basic view" **[v1.1]**
- "Calendar - advanced filters" **[v1.2]**

### Q: Can I skip the sync for small changes?

**A:** For typos/clarifications, yes. For feature changes (even small), always sync to maintain consistency.

### Q: How do I know when official docs are out of sync?

**A:** Run `git diff docs/idea/ docs/` and check "Last Synced" timestamps in idea/ file frontmatter.

### Q: What if I need to undo a sync?

**A:** Use `git reset HEAD~1` to undo the last commit (before pushing). Or create a new sync to revert specific changes.

---

## Reference: Workflow Files

### Entry Point: `workflow.md`

Contains:
- Workflow metadata (ID, version, owner)
- Agent assignments per step
- State management schema
- Error handling matrix
- Success criteria

### Step Files

**step-01-init.md** - Initialize or resume, create state file
**step-02-scan.md** - Detect changes in docs/idea/, extract phasing
**step-03-impact.md** - Apply decision matrix, map to affected docs
**step-04-propagate.md** - Execute approved file updates
**step-05-review.md** - Validate, commit to git, mark complete

---

*This guide is a living document. Update as workflow evolves.*
