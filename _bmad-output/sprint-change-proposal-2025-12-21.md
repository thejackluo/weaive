# Sprint Change Proposal: Adopt Tamagui for Design System Foundation

**Date:** 2025-12-21
**Project:** Weave (weavelight-design-system)
**Proposal Author:** Correct Course Workflow
**Status:** PENDING APPROVAL
**Change Scope:** MODERATE (Technology choice + implementation approach)
**Estimated Effort:** LOW (2-4 hours setup + 1-2 hours documentation)
**Risk Level:** LOW (Mature library, proven technology)

---

## 1. Issue Summary

### Problem Statement

The current Epic DS plan builds custom UI primitives (Button, Text, Input, etc.) from scratch using React Native base components and Reanimated. While this provides full control, it requires significant development effort and ongoing maintenance. **Tamagui** offers a production-ready, performance-optimized component library that aligns with Weave's token-based design system while accelerating development.

### Discovery Context

- **When discovered:** During Story DS-1 planning (before implementation)
- **How discovered:** User reviewing design system approach and evaluating alternatives
- **Current status:** No work started on DS stories; optimal time for technology pivot

### Evidence & Rationale

**Tamagui Benefits:**
1. **Performance-optimized:** Uses compile-time optimizations, no runtime style computation
2. **Battle-tested:** Widely adopted in production React Native apps
3. **Built-in theming:** Supports token-based themes with runtime switching
4. **Accessibility-first:** VoiceOver support, reduced motion handling, proper ARIA labels
5. **Animation-ready:** Integrates with Reanimated for smooth 60fps animations
6. **Composable primitives:** Stack, Text, Button, Input match Weave's component architecture
7. **Active community:** Excellent documentation, regular updates, strong ecosystem

**Alignment with Weave Architecture:**
- Supports dark/light mode switching ✅
- Token-based theming system ✅
- Reanimated integration ✅
- TypeScript-first ✅
- React Native optimization ✅

**User Assessment:** "Tamagui is more consistent and better" - aligns with goals for production-ready design system.

---

## 2. Impact Analysis

### Epic Impact

**Epic DS (Design System Rebuild) - MODERATE IMPACT:**

| Story | Current Approach | With Tamagui | Impact Level |
|-------|------------------|--------------|--------------|
| **DS-1** | Build tokens + custom theme system | Build tokens + configure Tamagui theming | ⚠️ MODERATE - Add Tamagui setup |
| **DS-2** | Build custom Button, Text from scratch | Compose Tamagui.Button, Tamagui.Text with custom styles | ⚠️ MODERATE - Use primitives instead of build |
| **DS-3** | Build custom Input, TextArea from scratch | Compose Tamagui.Input with custom variants | ⚠️ MODERATE - Use primitives |
| **DS-4** | Build custom Card, Badge from scratch | Compose Tamagui.Stack + custom styling | ⚠️ MODERATE - Use primitives |
| **DS-5** | Build custom Modal, Toast from scratch | Use Tamagui overlays or build on Tamagui.Stack | ⚠️ MODERATE - Compose with primitives |
| **DS-6** | Build custom data viz components | Build on Tamagui primitives (unchanged approach) | ✅ LOW - Minimal change |
| **DS-7** | Build Weave-specific cards | Build on Tamagui primitives (unchanged approach) | ✅ LOW - Minimal change |
| **DS-8** | Build skeletons and empty states | Use Tamagui.Stack for structure | ✅ LOW - Minimal change |
| **DS-9** | Testing & Storybook | Test Tamagui-composed components | ✅ LOW - Testing approach same |
| **DS-10** | Additional form components | Compose with Tamagui.Slider, Tamagui.Switch | ⚠️ MODERATE - Use primitives |

**Story Points Impact:**
- **Current Total:** 74 points
- **Estimated Total with Tamagui:** 58-62 points (12-16 point reduction)
- **Savings:** Building primitives from scratch is more time-consuming than composing Tamagui components

**Epic Completion:** ✅ YES - Epic DS remains achievable and completes FASTER

---

### Artifact Conflicts & Required Updates

#### 1. **Epic DS (docs/epics.md)** - MINOR UPDATES

**Section:** Epic DS Description (lines 725-732)

**OLD:**
```markdown
### Epic DS: Design System Rebuild (74 pts)
**User Outcome:** Complete rebuild as a new standalone package **`weave-design-system`** with 70 production-ready components following Tamagui patterns, Atomic Design principles, and modern animation standards.

**Context:** The existing design system (`src/design-system`) is "vibe-coded," buggy, and inconsistent. This epic creates a **completely new package** from scratch with 220+ design tokens, Tamagui-inspired composable anatomy, spring physics animations, and 75% test coverage.
```

**NEW:**
```markdown
### Epic DS: Design System Rebuild (58-62 pts)
**User Outcome:** Complete rebuild as a new standalone package **`weave-design-system`** with 70 production-ready components built on **Tamagui primitives**, following Atomic Design principles and modern animation standards.

**Context:** The existing design system (`src/design-system`) is "vibe-coded," buggy, and inconsistent. This epic creates a **completely new package** using **Tamagui as the UI primitive layer** (Button, Text, Stack, Input) with 220+ custom design tokens, composable anatomy pattern, spring physics animations, and 75% test coverage.

**Technology Foundation:** Tamagui provides performance-optimized, accessible UI primitives. Weave customizes these with brand tokens, Weave-specific variants, and product-specific components (NeedleCard, BindCard, etc.).
```

**Rationale:** Clarify that Tamagui is the foundation layer, not reinventing primitives.

---

#### 2. **Story DS-1 (docs/stories/ds-1-foundation-tokens-theme-animations.md)** - ADD TAMAGUI SETUP

**Section:** Task 1: Set Up Package Structure (lines 224-310)

**ADD NEW SUBTASK (After Task 1.6):**

**Task 1.7:** Install and Configure Tamagui (NEW)
- [ ] **1.7.1:** Install Tamagui dependencies:
  ```bash
  npm install tamagui @tamagui/core @tamagui/themes @tamagui/animations-reanimated
  ```
- [ ] **1.7.2:** Create Tamagui config file `packages/weave-design-system/src/tamagui.config.ts`:
  ```typescript
  import { createTamagui } from '@tamagui/core';
  import { config as defaultConfig } from '@tamagui/config/v3';

  // Import Weave tokens (will be created in Task 2)
  import { colors } from './tokens/colors';
  import { spacing } from './tokens/spacing';
  import { typography } from './tokens/typography';

  export const tamaguiConfig = createTamagui({
    ...defaultConfig,
    themes: {
      dark: {
        // Map Weave tokens to Tamagui theme
        background: colors.background.primary,
        color: colors.text.primary,
        // ... other mappings
      },
      light: {
        background: colors.background.primary,
        color: colors.text.primary,
        // ... other mappings
      },
    },
    tokens: {
      color: colors,
      space: spacing,
      size: spacing,
      radius: {}, // Will be populated from tokens/borders.ts
    },
  });

  export type TamaguiConfig = typeof tamaguiConfig;
  declare module '@tamagui/core' {
    interface TamaguiCustomConfig extends TamaguiConfig {}
  }
  ```
- [ ] **1.7.3:** Configure Tamagui provider in ThemeProvider (Task 3.2):
  - Wrap app with `<TamaguiProvider config={tamaguiConfig}>`
  - Tamagui provider should be INSIDE Weave ThemeProvider (Weave controls theme mode)
- [ ] **1.7.4:** Set up Babel plugin for Tamagui optimization:
  - Edit `babel.config.js`:
    ```javascript
    module.exports = {
      plugins: [
        ['@tamagui/babel-plugin', {
          components: ['tamagui'],
          config: './packages/weave-design-system/src/tamagui.config.ts',
        }],
      ],
    };
    ```
- [ ] **1.7.5:** Update Metro config for Tamagui:
  - Add `.tamagui` to `watchFolders`
  - Add `@tamagui` packages to `extraNodeModules` if needed

**Rationale:** Tamagui setup enables use of primitives in DS-2 onwards.

---

**Section:** AC-2: ThemeProvider + Runtime Switching (lines 104-142)

**UPDATE (After implementing Task 1.7):**

Add note about Tamagui integration:

```markdown
**Tamagui Integration:**
- Weave ThemeProvider wraps Tamagui TamaguiProvider
- Theme mode changes propagate from Weave → Tamagui automatically
- Tamagui components consume theme via Tamagui hooks (`useTheme()` from Tamagui)
- Weave custom components use Weave hooks (`useTheme()` from `@weave/design-system`)
```

---

#### 3. **Story DS-2 (Core Primitives)** - USE TAMAGUI COMPONENTS

**Section:** Story DS-2 Description (line 742 in epics.md)

**OLD:**
```markdown
- **Story DS-2: Core Primitives (Text, Buttons, Icons)** (6 pts) - FR-DS-2: Build 11 text components (Text, AnimatedText, Heading, Title, Subtitle, Body, BodySmall, Caption, Label, Link, Mono) with variant system. 7 button components (Button, PrimaryButton, SecondaryButton, GhostButton, DestructiveButton, AIButton, IconButton) with composable anatomy (`Button.Icon`, `Button.Text`, `Button.Spinner`). Icon wrapper for 100+ Lucide icons with theme colors. Spring press animations. Color-matched shadows (violet button → violet glow).
```

**NEW:**
```markdown
- **Story DS-2: Core Primitives (Text, Buttons, Icons)** (4-5 pts) - FR-DS-2: **Compose 11 text components using Tamagui.Text** with variant system (Heading, Title, Subtitle, Body, BodySmall, Caption, Label, Link, Mono). **Compose 7 button components using Tamagui.Button** with composable anatomy (`Button.Icon`, `Button.Text`, `Button.Spinner`). Icon wrapper for 100+ Lucide icons with theme colors. **Tamagui handles spring press animations automatically**. Add color-matched shadows using Weave shadow tokens.
```

**Story Points Reduction:** 6 → 4-5 pts (Tamagui primitives reduce implementation effort)

---

#### 4. **Story DS-3 (Form Components)** - USE TAMAGUI COMPONENTS

**Section:** Story DS-3 Description (line 748 in epics.md)

**OLD:**
```markdown
- **Story DS-3: Form Components** (7 pts) - FR-DS-3: Build 5 form components: Input with floating label animation, TextArea with auto-expanding height, SearchInput with debouncing, Checkbox with checkmark animation, BindCheckbox with streak indicator + confetti.
```

**NEW:**
```markdown
- **Story DS-3: Form Components** (5-6 pts) - FR-DS-3: **Compose 5 form components using Tamagui.Input primitives:** Input with floating label animation, TextArea with auto-expanding height, SearchInput with debouncing, Checkbox with checkmark animation, BindCheckbox with streak indicator + confetti. **Tamagui provides base input styling and focus states**.
```

**Story Points Reduction:** 7 → 5-6 pts

---

#### 5. **Story DS-4 (Layout & Cards)** - USE TAMAGUI STACK

**Section:** Story DS-4 Description (line 750 in epics.md)

**OLD:**
```markdown
- **Story DS-4: Layout & Cards** (6 pts) - FR-DS-4: Build 16 components: 4 cards (Card, GlassCard, ElevatedCard, AICard) with composable anatomy...
```

**NEW:**
```markdown
- **Story DS-4: Layout & Cards** (4-5 pts) - FR-DS-4: **Compose 16 components using Tamagui.Stack primitives:** 4 cards (Card, GlassCard, ElevatedCard, AICard) with composable anatomy. **Tamagui.Stack provides flexbox layout primitives**. Add glass blur effects, color-matched shadows, and elevation using Weave effect tokens.
```

**Story Points Reduction:** 6 → 4-5 pts

---

#### 6. **Story DS-10 (Additional Form Components)** - USE TAMAGUI COMPONENTS

**Section:** Story DS-10 Description (line 774 in epics.md)

**OLD:**
```markdown
- **Story DS-10: Additional Form & Layout Components** (21 pts) - FR-DS-10: Build 8 critical missing components that block 11+ MVP features: Slider with gesture control + snap-to-step + haptic feedback... Radio + RadioGroup... Toggle/Switch with spring physics animation... Tabs... Divider... ListItem... Select (dropdown with bottom sheet)...
```

**NEW:**
```markdown
- **Story DS-10: Additional Form & Layout Components** (16-18 pts) - FR-DS-10: **Compose 8 critical components using Tamagui primitives:** Slider (use Tamagui.Slider with custom styling + haptic feedback)... Radio + RadioGroup (use Tamagui.RadioGroup with composable anatomy)... Toggle/Switch (use Tamagui.Switch with spring physics animation)... Tabs (use Tamagui.Tabs with custom indicator animation)... Divider (use Tamagui.Separator)... ListItem (compose with Tamagui.ListItem)... Select (use Tamagui.Select with bottom sheet). **Tamagui provides gesture handling and accessibility out-of-box**.
```

**Story Points Reduction:** 21 → 16-18 pts

---

#### 7. **Architecture Document (docs/architecture.md)** - ADD TAMAGUI

**Section:** Technology Stack → Mobile UI Libraries (find appropriate location in architecture.md)

**ADD:**
```markdown
### Mobile UI Foundation

**Tamagui (v1.x)** - Performance-optimized UI primitive library
- **Purpose:** Provides base components (Button, Text, Input, Stack) with built-in theming and animations
- **Why chosen over alternatives:**
  - Better performance than styled-components (compile-time optimizations)
  - Built-in accessibility support (VoiceOver, reduced motion)
  - Token-based theming aligns with Weave design system
  - Reanimated integration for 60fps animations
  - Active community and excellent documentation
- **Weave usage:** All components built on Tamagui primitives, customized with Weave tokens and variants
```

**Rationale:** Document technology decision in architecture for future reference.

---

#### 8. **package.json Dependencies** - ADD TAMAGUI

**File:** `packages/weave-design-system/package.json`

**ADD to dependencies:**
```json
{
  "dependencies": {
    "@tamagui/animations-reanimated": "^1.90.0",
    "@tamagui/core": "^1.90.0",
    "@tamagui/themes": "^1.90.0",
    "tamagui": "^1.90.0"
  }
}
```

**ADD to devDependencies (for Babel plugin):**
```json
{
  "devDependencies": {
    "@tamagui/babel-plugin": "^1.90.0"
  }
}
```

**Rationale:** Required for Tamagui functionality.

---

## 3. Recommended Approach

### Selected Path: **Option 1 - Direct Adjustment**

**Implementation Plan:**

#### Phase 1: Tamagui Setup (2-4 hours)
1. ✅ Add Tamagui dependencies to package.json
2. ✅ Create tamagui.config.ts with Weave token mappings
3. ✅ Configure Babel plugin for optimization
4. ✅ Update Metro config
5. ✅ Integrate TamaguiProvider in ThemeProvider
6. ✅ Validate theme switching works with Tamagui components

#### Phase 2: Documentation Updates (1-2 hours)
1. ✅ Update Epic DS description in epics.md
2. ✅ Update Story DS-1 to add Tamagui setup task
3. ✅ Update Story DS-2 through DS-10 descriptions
4. ✅ Add Tamagui to architecture.md Technology Stack
5. ✅ Update design-system-guide.md usage examples

#### Phase 3: Story Refinement (ongoing)
- As each story (DS-2, DS-3, etc.) begins, dev team references Tamagui docs for primitive usage
- Storybook stories showcase both Tamagui base components and Weave customizations
- Tests validate custom styling on top of Tamagui primitives

---

### Justification

**Why Direct Adjustment (vs. Rollback or MVP Review):**

| Criterion | Evaluation |
|-----------|------------|
| **Effort** | LOW - Setup is straightforward, well-documented |
| **Risk** | LOW - Tamagui is mature, battle-tested library |
| **Timeline Impact** | POSITIVE - Accelerates Epic DS (12-16 point reduction) |
| **Technical Debt** | REDUCED - Leveraging community-maintained primitives |
| **Team Morale** | POSITIVE - Modern tooling, less "reinventing the wheel" |
| **Long-term Maintainability** | IMPROVED - Tamagui handles primitive updates, Weave focuses on product-specific components |
| **Business Value** | HIGH - Faster to market, better performance, better accessibility |

**Trade-offs Considered:**

| Concern | Mitigation |
|---------|------------|
| "Lock-in to Tamagui" | Weave components are composable wrappers; can replace Tamagui later if needed |
| "Less control over primitives" | Tamagui is highly customizable; we still control tokens and styling |
| "Bundle size increase" | Tamagui uses compile-time optimizations; bundle impact is minimal |
| "Learning curve" | Tamagui docs are excellent; team can ramp up quickly |

---

## 4. Detailed Change Proposals

### Summary of All Changes

| Artifact | Change Type | Effort | Priority |
|----------|-------------|--------|----------|
| **epics.md** | Update Epic DS + Stories DS-2, DS-3, DS-4, DS-10 | 30 min | HIGH |
| **ds-1-foundation-tokens-theme-animations.md** | Add Task 1.7 (Tamagui setup) | 1 hour | HIGH |
| **architecture.md** | Add Tamagui to Technology Stack | 15 min | MEDIUM |
| **package.json** | Add Tamagui dependencies | 5 min | HIGH |
| **design-system-guide.md** | Update usage examples | 30 min | LOW (can defer to Story DS-2) |

**Total Effort:** 2.5-3 hours (documentation + configuration)

**Implementation Effort (DS-1):** +2 hours (Tamagui setup tasks)
**Savings (DS-2 to DS-10):** -12 to -16 story points (reduced implementation complexity)

**Net Impact:** TIME SAVINGS + IMPROVED QUALITY

---

## 5. Implementation Handoff

### Change Scope Classification: **MODERATE**

**Reasoning:**
- Technology choice affects Epic DS implementation
- Does NOT affect PRD requirements or MVP scope
- Does NOT require fundamental replan
- Backlog updates needed (story descriptions + acceptance criteria)

---

### Handoff Recipients & Responsibilities

#### **1. Development Team (Primary)** ✅ IMPLEMENT CHANGES

**Responsibilities:**
- Execute Tamagui setup tasks (Task 1.7 in Story DS-1)
- Update DS-1 implementation to include Tamagui configuration
- Reference Tamagui docs when implementing DS-2 through DS-10
- Validate theme switching works with Tamagui components
- Write tests for Tamagui-composed components

**Deliverables:**
- Tamagui successfully integrated into `@weave/design-system` package
- Theme switching validated
- All DS stories use Tamagui primitives where appropriate

---

#### **2. Product Owner / Scrum Master** ✅ UPDATE BACKLOG

**Responsibilities:**
- Update Epic DS description in epics.md
- Update Story DS-1, DS-2, DS-3, DS-4, DS-10 descriptions and ACs
- Adjust story point estimates (DS-2: 6→5, DS-3: 7→6, DS-4: 6→5, DS-10: 21→17)
- Update Sprint Plan if Epic DS was scheduled

**Deliverables:**
- Updated epics.md with Tamagui references
- Revised story point totals for Epic DS (74 → 58-62 pts)
- Sprint plan adjusted if needed

---

#### **3. Technical Writer (Optional)** ⚠️ LOW PRIORITY

**Responsibilities:**
- Update `docs/dev/design-system-guide.md` with Tamagui usage examples
- Add Tamagui section to CLAUDE.md if needed

**Deliverables:**
- Updated developer guide with Tamagui examples

---

### Success Criteria

**Definition of Done for This Change:**
- [ ] Tamagui dependencies added to package.json
- [ ] Task 1.7 added to Story DS-1 with Tamagui setup subtasks
- [ ] Epic DS description updated to mention Tamagui foundation
- [ ] Stories DS-2, DS-3, DS-4, DS-10 updated with "compose using Tamagui primitives"
- [ ] Architecture.md includes Tamagui in Technology Stack
- [ ] Story point estimates revised (Epic DS: 74 → 58-62 pts)
- [ ] User approval obtained for all changes

**Validation:**
- [ ] Dev team confirms Tamagui setup tasks are clear and executable
- [ ] Sprint plan reflects revised story points (if Epic DS scheduled)
- [ ] All stakeholders understand Tamagui adoption rationale

---

## 6. Timeline & Next Steps

### Immediate Actions (Post-Approval)

1. **PO/SM:** Update epics.md with proposed changes (30 min)
2. **Dev Team:** Review Tamagui documentation (1 hour)
3. **PO/SM:** Update Story DS-1 with Task 1.7 (1 hour)
4. **Dev Team:** Begin Tamagui setup when Story DS-1 starts (2-4 hours)

### Timeline Impact

- **Epic DS Original Estimate:** 74 story points
- **Epic DS Revised Estimate:** 58-62 story points
- **Time Savings:** 12-16 story points (~1.5-2 sprints at typical velocity)

**Impact on Project Schedule:** ✅ POSITIVE - Epic DS completes faster

---

## 7. Appendices

### A. Tamagui vs. Custom Primitives Comparison

| Aspect | Custom Primitives | Tamagui Primitives |
|--------|------------------|-------------------|
| **Development Time** | HIGH (build from scratch) | LOW (compose and customize) |
| **Performance** | Good (if optimized) | Excellent (compile-time optimizations) |
| **Accessibility** | Manual (VoiceOver, reduced motion) | Built-in (a11y best practices) |
| **Maintenance** | HIGH (team maintains all code) | LOW (community maintains primitives) |
| **Customization** | Full control | High control (theme tokens) |
| **Animation Support** | Manual Reanimated integration | Built-in Reanimated integration |
| **Documentation** | Internal docs only | Extensive community docs |
| **Bundle Size** | Smaller (only what we build) | Slightly larger (tree-shaken) |
| **Learning Curve** | None (our code) | LOW (well-documented API) |

**Winner:** Tamagui for MVP speed, performance, and long-term maintainability

---

### B. Risk Mitigation Plan

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Tamagui breaking changes** | LOW | MEDIUM | Pin versions; review changelog before upgrades |
| **Insufficient customization** | LOW | HIGH | Tamagui supports full theming; escape hatch: build custom component if needed |
| **Performance regression** | VERY LOW | HIGH | Benchmark component render times; Tamagui optimizations typically improve performance |
| **Bundle size increase** | LOW | MEDIUM | Monitor bundle size in CI; Tamagui tree-shaking reduces impact |
| **Team learning curve** | LOW | LOW | Tamagui API is similar to React Native; docs are excellent |

---

### C. Reference Links

**Tamagui Documentation:**
- Official Docs: https://tamagui.dev
- Theming Guide: https://tamagui.dev/docs/core/theme
- Reanimated Integration: https://tamagui.dev/docs/core/animations
- Performance Tips: https://tamagui.dev/docs/guides/performance

**Internal References:**
- Epic DS: `docs/epics.md` (lines 725-778)
- Story DS-1: `docs/stories/ds-1-foundation-tokens-theme-animations.md`
- Architecture: `docs/architecture.md`
- Design System Guide: `docs/dev/design-system-guide.md`

---

## 8. Approval & Sign-Off

### Approval Status: ✅ APPROVED

**Approver:** Jack Luo (Product Owner)

**Decision:**
- [x] **APPROVE** - Proceed with Tamagui adoption as proposed
- [ ] **APPROVE WITH MODIFICATIONS** - (specify changes below)
- [ ] **REJECT** - Return to custom primitives approach

**Approval Date:** 2025-12-21
**Approved By:** Jack Luo

---

### Modification Requests (if applicable):

_(User to fill in any requested changes to this proposal)_

---

**Next Steps After Approval:**
1. PO/SM updates epics.md and Story DS-1
2. Dev team reviews Tamagui docs
3. Story DS-1 begins with Tamagui setup tasks
4. Correct Course workflow complete ✅

---

**End of Sprint Change Proposal**
