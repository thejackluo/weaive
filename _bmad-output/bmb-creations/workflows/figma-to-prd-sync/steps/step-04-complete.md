---
name: 'step-04-complete'
description: 'Complete the Figma to PRD Sync workflow with summary, file links, next actions, and cleanup options'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/figma-to-prd-sync'

# File References
thisStepFile: '{workflow_path}/steps/step-04-complete.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{project-root}/.sidecar-figma-to-prd-sync.json'
prdFile: '{project-root}/docs/prd.md'
figmaOutputPath: '{project-root}/docs/figma'
indexFile: '{project-root}/docs/figma/index.md'
---

# Step 4: Workflow Completion

## STEP GOAL:

To complete the Figma to PRD Sync workflow by summarizing accomplishments, providing access to all generated files, suggesting next actions, and offering cleanup options.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a UX Documentation Specialist and Requirements Analyst
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring closure and actionable guidance

### Step-Specific Rules:

- 🎯 Focus on clear completion and next steps
- 🚫 FORBIDDEN to suggest new work without user request
- 💬 Provide value through summary and guidance
- 🎉 Celebrate the accomplishment

## EXECUTION PROTOCOLS:

- 🎯 Load final state from sidecar
- 💾 Present comprehensive summary
- 📖 Provide all file links
- 🚫 Wait for user decision on cleanup

## CONTEXT BOUNDARIES:

- All work is complete
- Sidecar contains final state
- Focus on value delivered and next steps

## COMPLETION SEQUENCE:

### 1. Load Final State

Read `{sidecarFile}`:
- Extract `processed_wireframes` count
- Extract `started_date`
- Calculate total time spent (if last_updated available)
- Load coverage statistics from index file if needed

### 2. Summarize Accomplishments

Display completion summary:

"**🎉 Figma to PRD Sync Complete!**

Congratulations! You've successfully aligned your Figma wireframes with your PRD user stories.

**Session Summary:**
- **Started:** {started_date formatted}
- **Completed:** {current timestamp formatted}
- **Total Wireframes Processed:** {count}
- **Total PRD Tags Added:** {sum of all mapped_stories counts}
- **Coverage Achieved:** {percentage from index}%

**What You've Created:**

✓ **Wireframe Descriptions**
  - {count} semantic descriptions ready for development
  - Location: {figmaOutputPath}
  - Each includes UI components, interactions, user flows, and states

✓ **PRD Integration**
  - User stories tagged with Figma references
  - Clear mapping between requirements and designs
  - Updated: {prdFile}

✓ **Mapping Index**
  - Comprehensive wireframe-to-story mapping
  - Story-to-wireframe reverse lookup
  - Coverage statistics and discrepancy report
  - Location: {indexFile}

✓ **Design-Requirements Traceability**
  - Developers can easily find wireframes for each story
  - Product team can verify design coverage
  - QA can validate implementations against wireframes

---

**Value Delivered:**

Your team now has:
- Implementation-ready wireframe documentation
- Clear traceability between design and requirements
- Visibility into design coverage gaps
- A living document that can evolve with your product"

### 3. Provide File Links

List all generated files:

"**📁 Generated Files:**

**Wireframe Descriptions:**
{For each wireframe in sidecar:}
- [{wireframe-name}.md]({file_path})

**Master Index:**
- [Mapping Index & Discrepancy Report]({indexFile})

**Updated PRD:**
- [PRD with Figma Tags]({prdFile})

**Workflow State:**
- [Session Data]({sidecarFile})

All files are saved and ready to share with your team."

### 4. Suggest Next Actions

Provide actionable next steps:

"**📋 Suggested Next Actions:**

1. **Review Discrepancy Report**
   - Check: {indexFile}#discrepancy-report
   - Address any high-priority stories without wireframes
   - Validate that unmapped wireframes are intentional

2. **Share with Development Team**
   - Send the mapping index link
   - Point developers to wireframe descriptions
   - Use as implementation reference during sprints

3. **Integrate into Workflow**
   - Reference wireframes in sprint planning
   - Use descriptions for story refinement
   - Update wireframes as designs evolve

4. **Maintain Traceability**
   - Run this workflow when new wireframes are created
   - Keep descriptions current with design changes
   - Monitor coverage percentage over time

5. **Leverage for QA**
   - Use wireframes as test case references
   - Validate implementations match designs
   - Ensure all states are properly tested

**Pro Tips:**
- Bookmark the index file for quick reference
- Share wireframe descriptions in story tickets
- Review coverage during sprint retrospectives
- Aim for 80%+ coverage of user-facing stories"

### 5. Cleanup Options

Present cleanup menu:

"**Workflow Cleanup:**

**[R] Reset Workflow** - Clear all state and start fresh
  - Deletes sidecar file
  - Keeps all generated wireframe descriptions and index
  - Next run will be a new session

**[K] Keep State** - Preserve state for future updates
  - Keep sidecar file (marked as completed)
  - Can resume to add more wireframes later
  - Recommended if designs are still evolving

**[E] Exit** - Leave everything as-is
  - No changes to any files
  - Can manually manage state file later

Which option would you prefer?"

Wait for user selection.

#### Cleanup Handling:

- **IF R (Reset)**:
  - Update sidecar: set `status: "completed"`, add `completion_date`
  - Optional: move sidecar to archive or delete
  - Confirm: "✓ Workflow state reset. Next run will start fresh. All wireframe descriptions and index files are preserved."
  - Exit

- **IF K (Keep State)**:
  - Update sidecar: set `status: "completed"`, add `completion_date`
  - Keep sidecar file intact
  - Confirm: "✓ Workflow state saved. You can resume anytime to add more wireframes or regenerate reports."
  - Exit

- **IF E (Exit)**:
  - No changes to sidecar
  - Confirm: "✓ Exiting workflow. All files remain as-is."
  - Exit

- **IF Any other input**: Respond to user, then redisplay menu (step 5)

### 6. Final Message

After cleanup choice is made:

"**Thank you for using Figma to PRD Sync!**

You've successfully created comprehensive design-requirements traceability for your project. This investment in documentation will pay dividends throughout development, testing, and maintenance.

Your team now has a clear, navigable connection between wireframes and user stories that will improve communication, reduce ambiguity, and accelerate implementation.

**Need to run again?**
Simply execute the workflow and it will detect your previous session.

**Questions or feedback?**
Reach out anytime - I'm here to help!

Happy building! 🚀"

Workflow complete.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Final state loaded from sidecar
- Comprehensive summary presented
- All file links provided
- Next actions suggested clearly
- Cleanup options offered
- User choice handled appropriately
- Final message delivered
- Workflow exits gracefully

### ❌ SYSTEM FAILURE:

- Not loading final state
- Incomplete summary
- Missing file links
- No next actions provided
- Not offering cleanup options
- Not handling user choices
- Abrupt or unclear ending

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
