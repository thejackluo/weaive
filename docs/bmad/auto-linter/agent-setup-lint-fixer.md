# Agent Workspace Setup: AutoLinter

## Agent Type

Simple Agent

## Workspace Configuration

**No separate workspace needed** - Simple agents are self-contained and stateless.

AutoLinter is fully contained within its YAML configuration file with no external dependencies. All capabilities, prompts, and commands are embedded directly in the agent file.

## Setup Elements

### Simple Agent Architecture
- ✅ **Self-contained:** All logic in YAML prompts (no external files)
- ✅ **Stateless:** Each execution is independent, no memory between runs
- ✅ **No sidecar files needed:** No memory, knowledge base, or session management
- ✅ **No workspace directory:** Agent lives entirely in single YAML file

### What This Means
- **Easy deployment:** Just one file to install and compile
- **Simple maintenance:** Updates happen in one place
- **No setup overhead:** No directory structure or file management
- **Portable:** Can be shared as a single file

## Location

**Agent File:** `.bmad/custom/src/agents/auto-linter/auto-linter.agent.yaml`

**No additional files or folders required.**

## Workspace Skip Confirmation

Workspace setup appropriately skipped for Simple Agent architecture. AutoLinter is ready to proceed directly to customization and finalization phase.
