# Design System Viewer - Quick Start Guide

This guide explains how to preview and explore the Weave design system.

## Available Viewers

### 1. React Native Showcase (Interactive, In-App)

**Best for**: Testing components with real interactions, animations, and native device features

**Location**: `src/design-system/DesignSystemShowcase.tsx`

#### How to Use

Add to your app's navigation or create a debug screen:

```tsx
// In your app's navigation setup
import { DesignSystemShowcase } from '@/design-system/DesignSystemShowcase';

// Option A: Add as a screen
<Stack.Screen name="DesignSystem" component={DesignSystemShowcase} />

// Option B: Add to debug menu
function DebugMenu() {
  return (
    <View>
      <Button onPress={() => navigation.navigate('DesignSystem')}>
        View Design System
      </Button>
    </View>
  );
}

// Option C: Render directly for testing
import { DesignSystemShowcase } from '@/design-system/DesignSystemShowcase';

export default function App() {
  return <DesignSystemShowcase />;
}
```

#### Features

- ✅ All components interactive (buttons clickable, inputs editable)
- ✅ Real animations and gestures
- ✅ Native device rendering (accurate colors, fonts, spacing)
- ✅ Test on actual device or simulator
- ✅ See component states (hover, pressed, focused)
- ✅ Live theme switching

#### When to Use

- Developing new features
- Testing component behavior
- Verifying animations
- Testing on real devices
- QA and design reviews

---

### 2. HTML Viewer (Static, Quick Reference)

**Best for**: Quick color/spacing reference without running the app

**Location**: `src/design-system/design-system-viewer.html`

#### How to Use

##### Option A: Open in Browser
```bash
# macOS
open src/design-system/design-system-viewer.html

# Windows
start src/design-system/design-system-viewer.html

# Linux
xdg-open src/design-system/design-system-viewer.html
```

##### Option B: Double-click the file
Just double-click `design-system-viewer.html` in your file explorer

##### Option C: Drag to Browser
Drag the HTML file into any browser window

#### Features

- ✅ Instant preview (no build required)
- ✅ Works offline
- ✅ Color palette with hex codes
- ✅ Typography scales
- ✅ Spacing scale visualization
- ✅ Component examples
- ✅ Copy hex codes directly
- ✅ Searchable (Cmd/Ctrl + F)

#### When to Use

- Quick color reference
- Checking hex codes for design handoff
- Spacing reference while coding
- Sharing design system with non-developers
- Documentation and onboarding
- Working without running the app

---

## Which Viewer Should I Use?

| Task | React Native Showcase | HTML Viewer |
|------|----------------------|-------------|
| Copy hex color codes | ❌ | ✅ Best |
| Test button interactions | ✅ Best | ❌ |
| Quick spacing reference | ⚠️ Need to run app | ✅ Best |
| Test animations | ✅ Best | ❌ |
| Design handoff | ⚠️ Screenshots needed | ✅ Best |
| Test on real device | ✅ Best | ❌ |
| Development reference | ✅ Best | ⚠️ OK |
| Share with designers | ⚠️ Complex | ✅ Best |
| Verify font rendering | ✅ Best | ⚠️ Approximate |

---

## Common Tasks

### I need to copy a color hex code

**Use HTML Viewer**
1. Open `design-system-viewer.html`
2. Find the color swatch
3. Hex code is displayed below each swatch
4. Copy and paste

### I need to test a button press animation

**Use React Native Showcase**
1. Run your app
2. Navigate to Design System screen
3. Scroll to "Buttons" section
4. Tap buttons to test press animation

### I need to verify spacing between elements

**Use React Native Showcase** (for exact rendering)
1. Run on device/simulator
2. View the actual spacing
3. Use React DevTools to inspect

**Use HTML Viewer** (for quick reference)
1. Open HTML viewer
2. Scroll to "Spacing Scale"
3. See visual representation

### I need to show the design system to a designer

**Use HTML Viewer**
1. Open `design-system-viewer.html`
2. Share the HTML file or host it
3. Designers can view in any browser

**Alternative**: Take screenshots from React Native Showcase

---

## Developer Workflow Recommendations

### During Development

1. **Keep HTML viewer open** in a browser tab for quick color/spacing reference
2. **Use React Native showcase** when implementing new screens
3. **Refer to the developer guide** (`docs/dev/design-system-guide.md`) for code examples

### During Design Handoff

1. **Share HTML viewer** with designers for color/spacing specs
2. **Take screenshots** from React Native showcase for component states
3. **Reference the main README** (`src/design-system/README.md`) for component API

### During Code Review

1. **Check against HTML viewer** for correct colors/spacing
2. **Test interactions** in React Native showcase
3. **Verify accessibility** using React Native showcase

---

## Keyboard Shortcuts

### HTML Viewer (Browser)

- **Cmd/Ctrl + F**: Search for components, colors, or spacing values
- **Cmd/Ctrl + +/-**: Zoom in/out for better visibility
- **Cmd/Ctrl + R**: Refresh after updates

### React Native Showcase (App)

- Scroll gestures work as expected
- Interactive elements respond to touch
- Use native debugging tools (React DevTools, Flipper)

---

## Tips & Tricks

### HTML Viewer

**Bookmark it**: Add to browser bookmarks for instant access

**Print to PDF**: Use browser print function to create PDF reference

**Search colors**: Use Cmd+F and search for hex codes like "#5B8DEF"

**Quick comparison**: Open multiple browser tabs to compare different sections

### React Native Showcase

**Hot reload**: Edit components and see changes instantly

**Test edge cases**: Try long text, empty states, error states

**Screenshot**: Use device screenshot for documentation

**Accessibility testing**: Enable VoiceOver/TalkBack to test accessibility

---

## Troubleshooting

### HTML Viewer won't open

**Problem**: File won't open in browser

**Solution**:
- Right-click file → "Open with" → Choose your browser
- Or drag the file into an open browser window

### HTML Viewer looks wrong

**Problem**: Colors or spacing don't match

**Solution**:
- The HTML is a static approximation
- Use React Native Showcase for exact rendering
- HTML is best for reference, not pixel-perfect matching

### React Native Showcase is slow

**Problem**: Showcase screen loads slowly

**Solution**:
- This is normal - many components render at once
- For faster development, copy specific sections
- Use HTML viewer for quick reference

### Can't find the showcase in my app

**Problem**: Design system screen not appearing

**Solution**:
- Check that `DesignSystemShowcase.tsx` is imported
- Add it to your navigation stack
- Or render directly for testing

---

## Quick Reference

```bash
# Open HTML viewer
open src/design-system/design-system-viewer.html

# View showcase component
# Import in your app:
import { DesignSystemShowcase } from '@/design-system/DesignSystemShowcase';
```

**Files**:
- 📄 `design-system-viewer.html` - HTML static viewer
- 📱 `DesignSystemShowcase.tsx` - React Native interactive viewer
- 📖 `design-system-guide.md` - Developer documentation
- 📚 `README.md` - Component API reference

---

## Next Steps

1. Open the HTML viewer to familiarize yourself with colors and spacing
2. Add the React Native showcase to your app for interactive testing
3. Read the developer guide for implementation details
4. Start building with the design system!

---

Built for Weave - "See who you're becoming."
