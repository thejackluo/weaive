---
name: 'step-02-process-wireframe'
description: 'Process a single Figma wireframe: analyze, generate description, get approval, save, tag PRD, and update sidecar - then loop or finalize'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/figma-to-prd-sync'

# File References
thisStepFile: '{workflow_path}/steps/step-02-process-wireframe.md'
nextStepFinalize: '{workflow_path}/steps/step-03-generate-reports.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{project-root}/.sidecar-figma-to-prd-sync.json'
prdFile: '{project-root}/docs/prd.md'
figmaOutputPath: '{project-root}/docs/figma'
---

# Step 2: Process Wireframe

## STEP GOAL:

To process one Figma wireframe through the complete workflow: accept screenshot and name, analyze visually, generate semantic description, get user approval, save to file, identify and tag relevant PRD user stories, update sidecar, and present menu for next action (loop or finalize).

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: This is a LOOPING step - follow menu logic carefully
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a UX Documentation Specialist and Requirements Analyst
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring visual design analysis expertise, the user brings wireframes
- ✅ Together you create implementation-ready descriptions

### Step-Specific Rules:

- 🎯 Focus on processing ONE wireframe completely
- 🚫 FORBIDDEN to batch process multiple wireframes
- 💬 Get approval before saving any content
- 🔄 This step LOOPS - user controls when to finalize
- 📝 Follow the structured output format exactly

## EXECUTION PROTOCOLS:

- 🎯 Process wireframe systematically through all sub-steps
- 💾 Update sidecar after successful processing
- 📖 Follow output format specification from plan
- 🚫 FORBIDDEN to skip approval steps
- 🔄 Loop back to step 1 if user selects "Add Another"

## CONTEXT BOUNDARIES:

- One wireframe processed per iteration
- Sidecar file tracks all processed wireframes
- PRD file is read and updated with tags
- Output format must follow structured specification

## WIREFRAME PROCESSING SEQUENCE:

### 1. Request Wireframe Input

"**Process Wireframe**

Please provide:
1. **Wireframe screenshot** - Paste or upload the image
2. **Wireframe name** - What should I call this wireframe? (e.g., 'Home Dashboard', 'Onboarding Step 1')
3. **Context** (optional) - Any additional context about this screen?"

Wait for user to provide screenshot and name.

### 2. Validate Input

**Check for name conflicts:**

- Sanitize the provided name: lowercase, replace spaces with hyphens
- Check if file exists at `{figmaOutputPath}/{sanitized-name}.md`
- If exists:
  - Warn user: "A wireframe description already exists with the name '{sanitized-name}'. This might be from a previous session."
  - Suggest alternatives: "Would you like to:
    - [O] Overwrite the existing file
    - [V] Use a versioned name (e.g., '{sanitized-name}-v2')
    - [R] Provide a different name"
  - Wait for user choice and handle accordingly

**Validate screenshot:**

- Confirm image is provided
- If missing, request: "Please provide the wireframe screenshot so I can analyze it."

### 3. Analyze Wireframe

"Analyzing wireframe..."

Use vision capabilities to analyze the screenshot:
- Identify all visible UI components (buttons, inputs, cards, navigation, etc.)
- Note layout structure and hierarchy
- Identify text labels, button copy, headings
- Observe user interaction points
- Note any visible states (empty, populated, loading indicators, etc.)
- Consider user flow context

### 4. Generate Description

Generate a markdown description following the **structured format specification**:

**Required Sections:**

```markdown
# {Wireframe Name}

## Wireframe Information

**Name:** {wireframe-name}
**Created:** {current-date}
**Purpose:** {1-2 sentence explanation of what this screen is for}

## Visual Overview

{2-3 paragraph high-level description of what the screen shows and overall layout approach}

## UI Components

{Detailed bulleted list of all UI elements:}
- **Component type:** Description, label text, function
- Group related components together
- Include hierarchy (headers, sub-sections, etc.)

## Layout Structure

{Description of spatial organization:}
- Overall layout pattern (single column, grid, tabs, etc.)
- Visual hierarchy
- Key sections and containers
- Spacing and alignment patterns

## User Interactions

{What users can do:}
- Tap targets and their actions
- Gesture interactions (swipe, pull-to-refresh, etc.)
- Navigation actions (where buttons lead)
- Form interactions (if applicable)

## User Flow

{Context in the app:}
- **Entry Point:** Where users come from to reach this screen
- **Exit Points:** Where users can navigate to from here
- **Role in App:** How this fits in the overall application flow

## States & Variations

{Different states this screen can display:}
- **Empty State:** What shows when there's no data
- **Loading State:** Loading indicators or skeleton screens
- **Error State:** How errors are displayed
- **Success/Completion State:** Confirmation or completion UI
- **Conditional Elements:** UI that appears based on conditions

## Design Notes

{Optional - if applicable:}
- Special design considerations
- Accessibility features noted
- Responsive behavior
- Animation or transition notes

## Technical Notes

{Optional - if applicable:}
- Implementation hints
- API dependencies
- Data requirements
- Performance considerations

## Related Wireframes

{Optional - if applicable:}
- Links to connected screens
- Related user flows
```

**Quality Checklist:**
- All visible components are documented
- Layout is clearly described
- Interactions are specified
- User flow context is explained
- States and variations are covered
- Description is clear enough for developer implementation

### 5. Present for Approval

Display the generated description to the user.

"**Generated Description:**

[Show the complete markdown description]

**Review the description above. Select an option:**

**[A] Approve & Save** - Description looks good, save it and proceed

**[E] Edit Description** - I'll let you modify the description directly

**[R] Regenerate** - Generate a new description (provide feedback on what to improve)

**[S] Skip This Wireframe** - Don't save, return to main menu"

Wait for user selection.

#### Handle User Choice:

- **IF A**: Proceed to step 6 (Save Description)
- **IF E**:
  - Present description in editable format
  - Wait for user to provide edited version
  - Replace description with user's version
  - Proceed to step 6
- **IF R**:
  - Ask: "What would you like me to improve in the regenerated description?"
  - Wait for feedback
  - Regenerate with feedback incorporated
  - Return to step 5 (present again)
- **IF S**:
  - Confirm: "Skipping this wireframe. No files will be saved."
  - Jump to step 11 (Present Menu) with no updates

### 6. Save Description

Sanitize filename and save:

- Filename: `{sanitized-wireframe-name}.md`
- Full path: `{figmaOutputPath}/{sanitized-wireframe-name}.md`
- Content: The approved description from step 5

Write file and confirm:

"✓ Description saved to: {figmaOutputPath}/{sanitized-wireframe-name}.md"

### 7. Identify PRD Mappings

"Analyzing PRD for relevant user stories..."

Read `{prdFile}` and analyze:

- Identify all user stories/requirements in the PRD
- For each story, assess relevance to this wireframe:
  - Does the story mention UI elements visible in this wireframe?
  - Does the story describe user actions shown in this wireframe?
  - Does the story relate to the feature/flow this wireframe represents?
- Score relevance: high, medium, low
- Select high and medium relevance stories as suggestions

**Relevance Criteria:**
- Story explicitly mentions this screen or feature
- Story describes functionality visible in wireframe
- Story involves user flows that include this wireframe
- Story references UI elements present in wireframe

### 8. Suggest Story Mappings

Present suggested mappings:

"**Suggested PRD Story Mappings:**

Based on the wireframe analysis, I found these relevant user stories:

[For each high/medium relevance story:]
**Story: {Story ID/Title}**
- **Relevance:** {Why this story relates to the wireframe}
- **Location:** {Section/page reference in PRD}

**Select mapping approach:**

**[A] Approve All Suggestions** - Tag all suggested stories

**[S] Select Specific Stories** - I'll ask you to confirm each one individually

**[N] No Mappings** - Skip PRD tagging for this wireframe

**[M] Manual Entry** - Provide specific story IDs/titles to tag"

Wait for user selection.

#### Handle Mapping Choice:

- **IF A**: Use all suggested stories, proceed to step 9
- **IF S**:
  - For each suggested story, ask: "Tag this story? [Y/N]: {Story ID/Title}"
  - Collect yes responses
  - Proceed to step 9 with confirmed stories
- **IF N**:
  - Confirm: "Skipping PRD tagging for this wireframe."
  - Jump to step 10 (Update Sidecar) with empty mapped_stories
- **IF M**:
  - Ask: "Please provide story IDs or titles to tag (comma-separated):"
  - Parse user input
  - Validate stories exist in PRD
  - Proceed to step 9 with manual list

### 9. Tag PRD

For each confirmed story to tag:

**Locate Story in PRD:**
- Find the story section in the PRD content
- Identify the end of the story section (before next story or section)

**Check for Existing Tags:**
- Search for existing `[Figma: ...]` tags near this story
- If found, ask: "This story already has a Figma tag: {existing-tag}. Would you like to:
  - [A] Add another reference (multiple wireframes for one story)
  - [R] Replace the existing tag
  - [S] Skip tagging this story"
- Handle user choice

**Insert Tag:**
- Format: `[Figma: {sanitized-wireframe-name}.png]`
- Position: At the end of the story section, on a new line
- Ensure non-intrusive placement (doesn't disrupt readability)

**Update PRD File:**
- Write modified PRD content back to `{prdFile}`
- Preserve all existing content and formatting

Confirm tagging:

"✓ Tagged {count} user stories in PRD with [Figma: {sanitized-wireframe-name}.png]"

### 10. Update Sidecar

Load `{sidecarFile}`, add new wireframe entry:

```json
{
  "name": "{sanitized-wireframe-name}",
  "processed_date": "{current-ISO-timestamp}",
  "mapped_stories": ["{story-id-1}", "{story-id-2}", ...],
  "file_path": "docs/figma/{sanitized-wireframe-name}.md"
}
```

Update sidecar metadata:
- `last_updated`: current timestamp
- Append wireframe to `processed_wireframes` array

Save `{sidecarFile}`.

### 11. Present Menu

Display success summary:

"**Wireframe Processed Successfully!**

✓ Description saved: {wireframe-name}.md
✓ PRD tagged: {count} user stories
✓ Progress saved to workflow state

**Total Processed:** {total count from sidecar}

**What would you like to do next?**

**[A] Add Another Wireframe** - Process another wireframe

**[F] Finalize & Generate Reports** - Create mapping index and discrepancy report

**[V] View Processed Wireframes** - See list of all processed wireframes

**[Q] Quit & Save State** - Exit workflow (you can resume later)"

Wait for user selection.

#### Menu Handling Logic:

- **IF A**: Update sidecar `last_updated`, then **LOOP** - load, read entire file, then execute `{thisStepFile}` (restart this step from beginning)
- **IF F**: Update sidecar `last_updated`, then load, read entire file, then execute `{nextStepFinalize}`
- **IF V**:
  - Load and display processed wireframes from sidecar
  - Show: name, date, mapped stories count
  - Redisplay this menu (step 11)
- **IF Q**:
  - Update sidecar `last_updated`
  - Confirm: "Workflow state saved. Resume anytime by running the workflow again."
  - Exit gracefully
- **IF Any other input**: Respond to user, then redisplay menu

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Wireframe screenshot and name collected
- Visual analysis performed accurately
- Description generated following structured format
- User approval obtained before saving
- Description saved to correct location
- PRD analyzed and relevant stories identified
- User confirmed story mappings
- PRD tagged with Figma references
- Sidecar updated with wireframe entry
- Menu presented with correct options
- User choice handled appropriately

### ❌ SYSTEM FAILURE:

- Skipping approval steps
- Not following structured output format
- Saving without user confirmation
- Not checking for name conflicts
- Not validating PRD tag placement
- Not updating sidecar after processing
- Not handling menu options correctly
- Breaking the loop logic

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
