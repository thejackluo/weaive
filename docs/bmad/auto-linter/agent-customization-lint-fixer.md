# Agent Customization File: AutoLinter

## Customization Choice

**User chose:** Create customization file ✅

## Customization Purpose

The customization file provides a safe, easy way to tweak AutoLinter's behavior without modifying the core agent files. It acts as a settings overlay that allows experimentation with:

### Personality Adjustments
- Fine-tune communication style (add encouragement, change verbosity)
- Add or modify guiding principles
- Adjust tone while maintaining core identity

### Command Behavior
- **max_iterations** - Control convergence loop (default: 3)
- **verbosity** - Switch output detail level (summary/detailed/minimal)
- **suggest_hook_setup** - Control first-run prompting
- **exit_codes** - Customize CI/CD integration codes

### Experimental Features
- **show_iteration_progress** - See iteration-by-iteration changes
- **auto_rerun_after_manual_fix** - Continue iterating after manual changes
- **parallel_execution** - Run backend and frontend simultaneously

### Quick Settings
- **skip_typescript_check** - ESLint only for frontend (faster)
- **skip_ruff_format** - Ruff check only for backend
- **fail_fast** - Stop at first error instead of collecting all

## File Location

`.bmad/_cfg/agents/custom-auto-linter.customize.yaml`

## Usage Guidance

### Getting Started

1. **Open the file** in your editor
2. **Uncomment sections** you want to customize (remove `#`)
3. **Modify values** as needed
4. **Save and recompile** agent to apply changes
5. **Test and iterate** - comment out if something doesn't work

### Safety Features

- ✅ **Non-destructive** - Core agent remains unchanged
- ✅ **Reversible** - Just comment out or delete sections to revert
- ✅ **Experimental** - Safe space to try new approaches
- ✅ **Well-documented** - Comments explain each option

### Common Customizations

**Make it more encouraging:**
```yaml
personality:
  communication_style: |
    Direct and action-oriented with no-nonsense efficiency, celebrating wins with brief encouragement
```

**Reduce iterations for faster feedback:**
```yaml
commands:
  max_iterations: 2
```

**Enable detailed progress tracking:**
```yaml
commands:
  verbosity: 'detailed'
experimental:
  show_iteration_progress: true
```

**Speed up frontend linting:**
```yaml
quick_settings:
  skip_typescript_check: false  # Keep TypeScript
  # OR
  skip_typescript_check: true   # ESLint only (faster)
```

### Tips

- Start with one or two adjustments and see how they work
- All sections are optional - use only what you need
- Core defaults are sensible for most use cases
- Experiment freely - you can't break anything
- Share successful customizations with your team

## Template Structure

The customization file includes:
- **Metadata overrides** - Change display name or icon
- **Personality section** - Communication style and principles
- **Commands section** - Behavior and output settings
- **Experimental section** - Cutting-edge features to try
- **Quick settings** - Common toggles
- **Usage notes** - Inline documentation and examples

All sections start commented out, using core defaults until explicitly customized.

## Future Enhancements

As you use AutoLinter, you might discover you want to:
- Adjust iteration count based on project size
- Add custom pre/post-lint hooks
- Integrate with additional linters
- Customize output format for CI/CD tools

The customization file makes all these tweaks easy and safe!
