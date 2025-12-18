---
name: 'step-01-init'
description: 'Initialize the Figma to PRD Sync workflow by detecting continuation state and setting up sidecar file for tracking processed wireframes'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/figma-to-prd-sync'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-process-wireframe.md'
continueFile: '{workflow_path}/steps/step-01b-continue.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{project-root}/.sidecar-figma-to-prd-sync.json'
prdFile: '{project-root}/docs/prd.md'
figmaOutputPath: '{project-root}/docs/figma'
---

# Step 1: Workflow Initialization

## STEP GOAL:

To initialize the Figma to PRD Sync workflow by detecting continuation state, verifying paths, and setting up the sidecar file for tracking processed wireframes across sessions.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a UX Documentation Specialist and Requirements Analyst
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring visual design analysis and technical documentation expertise
- ✅ User brings their wireframes and product knowledge
- ✅ Together you create developer-ready descriptions and traceability

### Step-Specific Rules:

- 🎯 Focus ONLY on initialization and setup
- 🚫 FORBIDDEN to process wireframes in this step
- 💬 Handle initialization professionally
- 🚪 DETECT existing sidecar state and handle continuation properly

## EXECUTION PROTOCOLS:

- 🎯 Check for existing sidecar file first
- 💾 Initialize or load sidecar file appropriately
- 📖 Verify all required paths exist
- 🚫 FORBIDDEN to load next step until setup is complete

## CONTEXT BOUNDARIES:

- Variables from workflow.md are available in memory
- Sidecar file contains state from previous sessions if it exists
- Don't assume knowledge from other steps
- Path verification happens in this step

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow Session

First, check if the sidecar file already exists:

- Look for file at `{sidecarFile}`
- If exists, read the complete file
- If not exists, this is a fresh workflow start

### 2. Handle Continuation (If Sidecar Exists)

If the sidecar file exists:

**Check the status field:**
- If `status: "completed"` → Ask user: "I found a completed Figma to PRD Sync session from [date]. Would you like to:
  1. Start a new session (reset and begin fresh)
  2. Add more wireframes to the completed session"

  - If option 1: Delete sidecar file, proceed with fresh initialization below
  - If option 2: Load `{continueFile}` immediately

- If `status: "in_progress"` → **STOP here** and load `{continueFile}` immediately
  - Do not proceed with any initialization tasks
  - Let step-01b handle the continuation logic

### 3. Fresh Workflow Initialization

If no sidecar exists or user chose to start fresh:

**Welcome Message:**

"Welcome to the **Figma to PRD Sync** workflow!

This workflow helps you maintain alignment between your Figma wireframes and PRD user stories by:
- Analyzing wireframes and generating semantic descriptions
- Mapping wireframes to relevant user stories
- Tagging your PRD with Figma references
- Creating comprehensive mapping indexes and discrepancy reports

You can process wireframes one at a time, and the workflow saves your progress so you can resume anytime."

**Verify Required Paths:**

1. **PRD Document**
   - Check if file exists at: `{prdFile}`
   - If not found, ask user: "I couldn't find the PRD at {prdFile}. Please provide the correct path to your PRD document."
   - Store the confirmed path

2. **Figma Output Folder**
   - Check if directory exists at: `{figmaOutputPath}`
   - If not found, create it: `mkdir -p {figmaOutputPath}`
   - Confirm to user: "Wireframe descriptions will be saved to: {figmaOutputPath}"

**Initialize Sidecar File:**

Create `{sidecarFile}` with the following content:

```json
{
  "workflow_name": "figma-to-prd-sync",
  "started_date": "[current ISO timestamp]",
  "last_updated": "[current ISO timestamp]",
  "status": "in_progress",
  "processed_wireframes": [],
  "prd_path": "[confirmed PRD path]",
  "figma_output_path": "[confirmed figma output path]"
}
```

**Confirm Setup:**

"Setup complete! Ready to process your first wireframe."

### 4. Proceed to Next Step

Load, read entire file, then execute `{nextStepFile}` to begin processing wireframes.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Sidecar file checked for continuation
- Continuation routed to step-01b if needed
- Fresh workflow initialized with verified paths
- Sidecar file created with correct structure
- Ready to proceed to wireframe processing

### ❌ SYSTEM FAILURE:

- Not checking for sidecar file
- Proceeding without path verification
- Creating malformed sidecar file
- Not routing to continuation step when needed
- Skipping welcome message for fresh workflows

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
