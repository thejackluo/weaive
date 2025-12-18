---
name: 'step-01b-continue'
description: 'Resume the Figma to PRD Sync workflow from a previous session by loading sidecar state and presenting continuation options'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/figma-to-prd-sync'

# File References
thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
nextStepProcess: '{workflow_path}/steps/step-02-process-wireframe.md'
nextStepFinalize: '{workflow_path}/steps/step-03-generate-reports.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{project-root}/.sidecar-figma-to-prd-sync.json'
---

# Step 1b: Continue Workflow

## STEP GOAL:

To resume the Figma to PRD Sync workflow from a previous session by loading the sidecar state and presenting the user with options to continue processing wireframes or finalize with reports.

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
- ✅ You bring visual design analysis and technical documentation expertise

### Step-Specific Rules:

- 🎯 Focus ONLY on loading state and presenting continuation options
- 🚫 FORBIDDEN to process wireframes in this step
- 💬 Present state clearly and offer clear navigation
- 🚪 Route user to appropriate next step based on their choice

## EXECUTION PROTOCOLS:

- 🎯 Load and parse sidecar file
- 💾 Present current workflow state clearly
- 📖 Provide menu for user decision
- 🚫 FORBIDDEN to proceed without user selection

## CONTEXT BOUNDARIES:

- Sidecar file contains all workflow state
- Previous wireframes and mappings are stored
- User decides whether to add more or finalize

## CONTINUATION SEQUENCE:

### 1. Load Workflow State

Read and parse `{sidecarFile}`:

- Extract `processed_wireframes` array
- Extract `started_date` and `last_updated`
- Extract `prd_path` and `figma_output_path`
- Count total wireframes processed

### 2. Present Workflow Summary

Display the current state:

"**Welcome back to Figma to PRD Sync!**

**Current Session Status:**
- Started: [started_date formatted nicely]
- Last Updated: [last_updated formatted nicely]
- Wireframes Processed: [count]
- PRD: [prd_path]
- Output Folder: [figma_output_path]

**Processed Wireframes:**
[List each wireframe name from processed_wireframes array, showing:
  - Wireframe name
  - Processing date
  - Number of mapped stories
]"

### 3. Present Menu Options

Display: **Select an Option:**

**[A] Add More Wireframes** - Process additional wireframes one at a time

**[F] Finalize & Generate Reports** - Create mapping index and discrepancy report

**[V] View Processed Wireframes** - See detailed list of all processed wireframes

**[Q] Quit** - Exit workflow (state is saved)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- User can chat or ask questions - always respond and redisplay menu
- Use menu handling logic below

#### Menu Handling Logic:

- **IF A**: Update sidecar `last_updated`, then load, read entire file, then execute `{nextStepProcess}`
- **IF F**: Update sidecar `last_updated`, then load, read entire file, then execute `{nextStepFinalize}`
- **IF V**: Display detailed wireframe list with full metadata from sidecar, then redisplay menu
- **IF Q**: Save final timestamp to sidecar, exit gracefully with "Workflow state saved. Resume anytime by running the workflow again."
- **IF Any other input**: Help user, respond to questions, then redisplay menu

### 4. Execute User Choice

Based on user selection:

- **Add More Wireframes (A)**:
  - Update `last_updated` in sidecar
  - Load `{nextStepProcess}` to continue processing wireframes

- **Finalize (F)**:
  - Update `last_updated` in sidecar
  - Load `{nextStepFinalize}` to generate reports

- **View (V)**:
  - Display detailed list from sidecar
  - Return to menu presentation (step 3)

- **Quit (Q)**:
  - Update `last_updated` in sidecar
  - Exit with confirmation message

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Sidecar file loaded successfully
- Workflow state presented clearly
- Menu displayed with all options
- User selection handled correctly
- Routed to appropriate next step

### ❌ SYSTEM FAILURE:

- Not loading sidecar file
- Presenting incomplete or incorrect state
- Not waiting for user input
- Routing incorrectly based on selection
- Not updating sidecar timestamps

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
