---
name: 'step-03-generate-reports'
description: 'Generate comprehensive mapping index and discrepancy report by analyzing all processed wireframes and PRD user stories'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/figma-to-prd-sync'

# File References
thisStepFile: '{workflow_path}/steps/step-03-generate-reports.md'
nextStepComplete: '{workflow_path}/steps/step-04-complete.md'
backStepProcess: '{workflow_path}/steps/step-02-process-wireframe.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{project-root}/.sidecar-figma-to-prd-sync.json'
prdFile: '{project-root}/docs/prd.md'
figmaOutputPath: '{project-root}/docs/figma'
indexFile: '{project-root}/docs/figma/index.md'
---

# Step 3: Generate Reports

## STEP GOAL:

To generate a comprehensive mapping index and discrepancy report by analyzing all processed wireframes, extracting PRD user stories, building bidirectional mapping tables, calculating coverage statistics, and identifying gaps in design-requirements alignment.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a UX Documentation Specialist and Requirements Analyst
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring analysis and reporting expertise

### Step-Specific Rules:

- 🎯 Focus on comprehensive analysis and reporting
- 🚫 FORBIDDEN to modify wireframe descriptions or PRD
- 💬 Present findings clearly with actionable insights
- 📊 Follow structured index format exactly

## EXECUTION PROTOCOLS:

- 🎯 Analyze all available data systematically
- 💾 Generate complete index file
- 📖 Calculate accurate statistics
- 🚫 FORBIDDEN to skip any report sections

## CONTEXT BOUNDARIES:

- All wireframes in sidecar are processed
- PRD contains all user stories
- Index file is the final deliverable
- Discrepancies highlight gaps

## REPORT GENERATION SEQUENCE:

### 1. Load All Data

"Generating mapping index and discrepancy report..."

**Load Sidecar:**
- Read `{sidecarFile}`
- Extract `processed_wireframes` array
- Count total wireframes processed

**Load Wireframe Descriptions:**
- For each wireframe in sidecar:
  - Read description file from `file_path`
  - Extract **Visual Overview** section as summary (first paragraph)
  - Store: {name, summary, mapped_stories, file_path}

**Load PRD:**
- Read `{prdFile}`
- Parse to identify all user stories
- Extract:
  - Story IDs/titles
  - Story locations (section/page references)
  - Existing `[Figma: ...]` tags
- Build list of all stories with their Figma tags

### 2. Build Wireframe-to-Story Mapping

Create bidirectional mapping:

**For each wireframe:**
- Wireframe name
- Associated user stories (from sidecar `mapped_stories`)
- Description summary (from wireframe file)
- File link: `[wireframe-name](./wireframe-name.md)`

Sort alphabetically by wireframe name.

### 3. Build Story-to-Wireframe Mapping

**For each user story in PRD:**
- Story ID/title
- Associated wireframes (from PRD Figma tags)
- Notes (optional context)

Sort by story order in PRD (maintain original sequence).

### 4. Calculate Coverage Statistics

**Compute:**
- Total wireframes processed: {count from sidecar}
- Total user stories in PRD: {count from PRD parse}
- Stories with wireframes: {count stories that have Figma tags}
- Stories without wireframes: {total stories - stories with tags}
- Wireframes with story mappings: {count wireframes with non-empty mapped_stories}
- Wireframes without mappings: {total wireframes - wireframes with mappings}
- Average wireframes per story: {total wireframe-story mappings / stories with wireframes}
- Average stories per wireframe: {total wireframe-story mappings / wireframes with mappings}
- Coverage percentage: {(stories with wireframes / total stories) * 100}%

### 5. Identify Discrepancies

**User Stories Without Wireframes:**
- List all story IDs/titles that have NO `[Figma: ...]` tags
- Include PRD section reference for each
- Note priority if available in PRD

**Wireframes Without Story Mappings:**
- List all wireframe names from sidecar where `mapped_stories` is empty
- Note when processed
- Suggest possible reasons:
  - Exploratory design work
  - Deprecated flows
  - Future features not yet in PRD
  - Admin/utility screens

### 6. Generate Recommendations

Based on discrepancies:

**Prioritized Actions:**
1. Review high-priority stories without wireframes
2. Create wireframes for critical user flows missing designs
3. Revisit unmapped wireframes to determine if PRD needs updates
4. Validate that exploratory wireframes have documented purpose

**Coverage Improvement:**
- Target: Aim for 80%+ coverage of user-facing stories
- Focus: Prioritize core user flows first
- Update: Keep index current as designs evolve

**Alignment Quality:**
- Strong: {coverage percentage}% of stories have design references
- Gaps: {count} stories need wireframes
- Orphans: {count} wireframes need story context

### 7. Write Index File

Create `{indexFile}` with the following structure:

```markdown
# Figma Wireframe to PRD Mapping Index

**Last Updated:** {current-timestamp}

---

## Overview

This index maps Figma wireframes to PRD user stories, providing traceability between design artifacts and requirements.

**Summary Statistics:**
- Total Wireframes Processed: {count}
- Total User Stories in PRD: {count}
- Stories with Wireframes: {count} ({percentage}%)
- Wireframes with Story Mappings: {count} ({percentage}%)

---

## Wireframe-to-Story Mapping

| Wireframe Name | Associated User Stories | Description Summary |
|----------------|------------------------|---------------------|
{For each wireframe, sorted alphabetically:}
| [{wireframe-name}](./{wireframe-name}.md) | {story-ids} | {summary-excerpt} |

---

## Story-to-Wireframe Mapping

| User Story | Associated Wireframes | Notes |
|------------|----------------------|-------|
{For each story, sorted by PRD order:}
| {story-id/title} | [{wireframe-1}](./{wireframe-1}.md), [{wireframe-2}](./{wireframe-2}.md) | {notes} |

---

## Coverage Statistics

### Overall Coverage
- **Total Wireframes:** {count}
- **Total User Stories:** {count}
- **Coverage Percentage:** {percentage}%

### Breakdown
- **Stories with Wireframes:** {count} ({percentage}%)
- **Stories without Wireframes:** {count} ({percentage}%)
- **Wireframes with Story Mappings:** {count} ({percentage}%)
- **Wireframes without Mappings:** {count} ({percentage}%)

### Averages
- **Average Wireframes per Story:** {number}
- **Average Stories per Wireframe:** {number}

---

## Discrepancy Report

### User Stories Without Wireframes

{If any exist:}
The following user stories have no associated wireframes:

{For each story without wireframe:}
- **{story-id/title}**
  - Location: {PRD section reference}
  - Priority: {if available}

{If none:}
✓ All user stories have associated wireframes.

---

### Wireframes Without Story Mappings

{If any exist:}
The following wireframes have no PRD story mappings:

{For each unmapped wireframe:}
- **{wireframe-name}**
  - Processed: {date}
  - Possible Reason: {suggestion}

{If none:}
✓ All wireframes are mapped to user stories.

---

## Recommendations

### Prioritized Actions

1. **{Action 1}**
   - {Description}
   - Impact: {High/Medium/Low}

2. **{Action 2}**
   - {Description}
   - Impact: {High/Medium/Low}

### Coverage Improvement Plan

{Generated recommendations based on analysis}

### Alignment Quality Assessment

**Strengths:**
- {List positive findings}

**Gaps:**
- {List areas needing attention}

**Next Steps:**
- {Suggested actions}

---

## Maintenance

To keep this index current:
- Run the Figma to PRD Sync workflow when new wireframes are created
- Update wireframe descriptions as designs evolve
- Review discrepancies regularly during sprint planning
- Aim for 80%+ coverage of user-facing stories

---

*Generated by Figma to PRD Sync Workflow*
```

Save the index file.

### 8. Present Summary

Display key findings:

"**Mapping Index Generated Successfully!**

✓ Index file created: {indexFile}

**Summary:**
- Total Wireframes: {count}
- Total User Stories: {count}
- Coverage: {percentage}%

**Discrepancies:**
- Stories without wireframes: {count}
- Wireframes without mappings: {count}

{If discrepancies > 0:}
⚠️ Review the discrepancy report for details on gaps.

{If coverage >= 80%:}
✓ Strong coverage! {percentage}% of stories have wireframes.

{If coverage < 80%:}
⚡ Opportunity to improve coverage (current: {percentage}%).

**What would you like to do?**

**[C] Complete Workflow** - Finish and review final summary

**[A] Add More Wireframes** - Process additional wireframes to improve coverage

**[V] View Index File** - Display the complete index content"

Wait for user selection.

#### Menu Handling Logic:

- **IF C**: Update sidecar, then load, read entire file, then execute `{nextStepComplete}`
- **IF A**: Update sidecar, then load, read entire file, then execute `{backStepProcess}`
- **IF V**:
  - Read and display `{indexFile}` content
  - Redisplay menu (step 8)
- **IF Any other input**: Respond to user, then redisplay menu

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All data sources loaded successfully
- Wireframe-to-story mapping created
- Story-to-wireframe mapping created
- Coverage statistics calculated accurately
- Discrepancies identified correctly
- Recommendations generated
- Index file written with proper formatting
- Summary presented clearly
- Menu handled appropriately

### ❌ SYSTEM FAILURE:

- Not loading all data sources
- Incorrect mapping tables
- Wrong statistics calculations
- Missing discrepancy analysis
- Incomplete index file
- Not following structured format
- Not presenting menu options

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
