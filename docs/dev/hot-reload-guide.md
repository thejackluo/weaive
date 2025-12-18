# Fast Refresh Guide for Expo SDK 54

## TL;DR - When to Reload vs When Not To

| What Changed | Fast Refresh Works? | Action Needed |
|--------------|-------------------|---------------|
| **React component code** | ✅ Auto-reload (1-2 sec) | Nothing - just save |
| **TypeScript types** | ✅ Auto-reload | Nothing - just save |
| **Styles (Tailwind classes)** | ✅ Auto-reload | Nothing - just save |
| **JavaScript logic** | ✅ Auto-reload | Nothing - just save |
| **Import statements** | ✅ Auto-reload | Nothing - just save |
| **babel.config.js** | ❌ Requires restart | Stop + `npx expo start` |
| **metro.config.js** | ❌ Requires restart | Stop + `npx expo start` |
| **tailwind.config.js** | ❌ Requires restart | Stop + `npx expo start --clear` |
| **app.json / app config** | ❌ Requires restart | Stop + `npx expo start` |
| **Installed packages** | ⚠️ Usually needs restart | Stop + `npx expo start` |
| **Native dependencies** | 🚨 Rebuild required | Stop + rebuild dev client |
| **Metro stuck/cursed** | 🚨 Clear cache | `npx expo start --clear` |

## What is Fast Refresh?

**Fast Refresh** is React Native's modern hot-update system (Expo doesn't really call it "Hot Reload" anymore).

**Key characteristics:**
- ✅ Enabled by default in Expo SDK 54
- ✅ Preserves component state (like Next.js Fast Refresh)
- ✅ Near-instant updates when you save (1-2 seconds)
- ✅ Error resilient - recovers automatically from syntax errors
- ✅ Works on mobile (iOS/Android) and web

**How it works:**
```
Save file → Metro detects change → Bundles update → Sends to device → Component updates
```

## Normal Development Workflow

### Start Once, Edit Forever

```bash
# Start the dev server
npx expo start

# Or directly launch on a device
npx expo start --ios
npx expo start --android
```

**What you should experience:**
1. Edit any `.tsx` file
2. Save (Cmd+S / Ctrl+S)
3. Metro shows "Bundling... 100%" in terminal
4. App updates in 1-2 seconds
5. Component state preserved (input values, scroll position, etc.)

**No manual reload needed!** This should feel like Next.js during development.

### Terminal Shortcuts (While Metro is Running)

```
R - Reload the app on all connected devices
M - Open dev menu on connected device
W - Open in web browser
J - Open JavaScript debugger
D - Open React DevTools
```

Press these keys in the Metro terminal to trigger actions without restarting.

## Scenarios: When Fast Refresh Works Automatically

Fast Refresh handles these changes **without any manual intervention:**

### ✅ React Component Changes
```tsx
// Before
export default function MyButton() {
  return <Text>Click</Text>;
}

// After - Just save, auto-reload in 1-2 sec
export default function MyButton() {
  return <Button>Click Me</Button>;
}
```

### ✅ TypeScript Type Changes
```tsx
// Before
interface User { name: string }

// After - Just save, auto-reload
interface User {
  name: string;
  email: string;  // Added field
}
```

### ✅ Style Changes (Tailwind/NativeWind)
```tsx
// Before
<View className="bg-blue-500 p-4">

// After - Just save, auto-reload
<View className="bg-red-600 p-8 rounded-lg">
```

### ✅ JavaScript Logic Changes
```tsx
// Before
const total = items.reduce((sum, item) => sum + item.price, 0);

// After - Just save, auto-reload
const total = items
  .filter(item => !item.discount)
  .reduce((sum, item) => sum + item.price, 0);
```

### ✅ Import Statement Changes
```tsx
// Before
import { Button } from '@/components/Button';

// After - Just save, auto-reload
import { PrimaryButton } from '@/design-system';
```

**Key point:** For all these scenarios, **do not restart Metro**. Just save and wait 1-2 seconds.

## Scenarios: When Manual Reload is Needed

### ⚠️ Scenario 1: JavaScript Runtime Errors

**Symptom:** Red error screen appears, but after you fix the code, the error screen doesn't dismiss.

**Why it happens:** Fast Refresh caught the error but didn't recover automatically.

**Solution:**
```bash
# Option A: Press 'R' in Metro terminal (fastest)
# Option B: Shake device → tap "Reload"
# Option C: Dev menu → "Reload"
```

**Example:**
```tsx
// You save this (typo):
const user = userData.nmae;  // ❌ Red error screen

// You fix it:
const user = userData.name;  // ✅ Fixed

// But red screen stays? Press 'R' to reload manually
```

### ⚠️ Scenario 2: Fast Refresh Disabled Accidentally

**Symptom:** Changes not appearing at all, even after saving.

**Why it happens:** Fast Refresh toggle got turned off in dev menu.

**Solution:**
```bash
# On device:
1. Shake device (or Cmd+D on iOS simulator, Cmd+M on Android)
2. Look for "Enable Fast Refresh" option
3. If you see "Disable Fast Refresh", it's already ON (good)
4. If you see "Enable Fast Refresh", tap it to turn ON
```

### ⚠️ Scenario 3: Changes Not Appearing (Watchman Issue on WSL2)

**Symptom:** Metro shows "100%" but changes don't appear on device.

**Why it happens:** Watchman file watcher isn't detecting changes (common on WSL2).

**Solution:**
```bash
# Quick fix: Manual reload
Press 'R' in Metro terminal

# Persistent issue: Reset Watchman
watchman watch-del-all
npx expo start
```

## Scenarios: When Cache Clear is Needed

Use `--clear` flag to clear Metro bundler cache. This is **not** for normal development - only when Metro is "stuck" on stale transforms.

### 🚨 Scenario 1: Modified Tailwind Config

**Why cache clear needed:** Metro caches the generated Tailwind CSS. Changes to `tailwind.config.js` won't apply without clearing.

```bash
# After modifying tailwind.config.js
npx expo start --clear
```

### 🚨 Scenario 2: Metro Showing Stale Code

**Symptom:** You changed code, saved, reloaded, but old code still running.

**Why it happens:** Metro's transform cache is corrupted or stale.

```bash
npx expo start --clear
```

### 🚨 Scenario 3: Ghost Bugs

**Symptom:** Bugs that "shouldn't exist" based on current code, but persist across reloads.

**Why it happens:** Metro serving cached transforms from old code.

```bash
npx expo start --clear
```

**Note:** If `--clear` doesn't fix it, try the nuclear option (see below).

## Scenarios: When Full Restart is Needed

Stop Metro (Ctrl+C) and restart with `npx expo start`. **Do not** use `--clear` unless Metro is actually stuck.

### 🔄 Scenario 1: Config File Changes

**Files that require restart:**
- `babel.config.js` - Changes babel plugins/presets
- `metro.config.js` - Changes bundler behavior
- `app.json` / `app.config.js` - Changes app configuration
- `tsconfig.json` (sometimes) - Changes TypeScript path mappings

**Why restart needed:** These files are read once at Metro startup, not watched by Fast Refresh.

```bash
# After modifying any of these files:
Ctrl+C  # Stop Metro
npx expo start  # Restart (no --clear needed usually)
```

### 🔄 Scenario 2: Installed New Packages

**Why restart needed:** Metro needs to re-resolve dependency graph.

```bash
npm install some-package
# or
npx expo install some-package

# Then restart Metro:
Ctrl+C
npx expo start
```

**Exception:** If installation seems weird or errors occur, use `--clear`:
```bash
npx expo start --clear
```

### 🔄 Scenario 3: Environment Variables Changed

**Why restart needed:** Env vars loaded at Metro startup via `babel-plugin-inline-dotenv`.

```bash
# After modifying .env file:
Ctrl+C
npx expo start
```

## Scenarios: When Rebuild is Needed

Some changes require rebuilding the native app, not just restarting Metro.

### 🏗️ Scenario 1: Native Dependency Installed

**Examples:** `react-native-reanimated`, `react-native-screens`, `expo-camera`

**Why rebuild needed:** Native modules require linking into the native app binary.

```bash
# If using Expo Go:
❌ Won't work - Expo Go has fixed native modules

# If using development build:
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

### 🏗️ Scenario 2: Changed Native Config in app.json

**Examples:**
- Changed `ios.bundleIdentifier`
- Changed `android.package`
- Added/removed native plugins
- Modified `expo.plugins` array

```bash
npx expo prebuild --clean
npx expo run:ios  # or run:android
```

### 🏗️ Scenario 3: Updated Expo SDK Version

```bash
npx expo install --fix  # Update all Expo packages
npx expo prebuild --clean
npx expo run:ios  # or run:android
```

## Bug Categorization: Reload Strategy by Issue Type

### Category A: JavaScript/TypeScript Errors

**Examples:**
- Syntax errors (missing semicolon, bracket, etc.)
- TypeScript type errors
- Runtime errors (undefined variable, null reference)
- Import path errors

**Fast Refresh behavior:**
- Shows red error screen immediately
- Auto-recovers when you fix and save (usually)
- If error screen persists after fix: Press `R` to reload

**Strategy:**
```
1. See red error screen
2. Fix the error
3. Save file
4. Wait 2 seconds for auto-recovery
5. If error screen persists: Press 'R' in Metro terminal
```

### Category B: Package/Dependency Issues

**Examples:**
- `Cannot find module 'some-package'`
- Version conflicts between packages
- Missing peer dependencies
- Native module not found

**Fast Refresh behavior:**
- ❌ Fast Refresh can't fix missing packages
- Requires Metro restart minimum
- May require rebuild if native dependency

**Strategy:**
```
1. See error about missing package
2. Install package: npm install some-package
3. Restart Metro: Ctrl+C → npx expo start
4. If native module: Rebuild (npx expo run:ios)
```

### Category C: Configuration Issues

**Examples:**
- Changes to `babel.config.js` not applying
- Changes to `metro.config.js` not applying
- Changes to `tailwind.config.js` not applying
- Alias paths not resolving

**Fast Refresh behavior:**
- ❌ Config files not watched by Fast Refresh
- Requires Metro restart minimum
- Tailwind config: Requires `--clear` flag

**Strategy:**
```
1. Modify config file
2. Stop Metro: Ctrl+C
3. Restart with/without clear:
   - babel.config.js: npx expo start
   - metro.config.js: npx expo start
   - tailwind.config.js: npx expo start --clear
```

### Category D: Cache/Stale State Issues

**Examples:**
- Old code still running despite changes
- Changes not appearing after multiple reloads
- "Ghost bugs" that shouldn't exist
- Metro bundling wrong file versions

**Fast Refresh behavior:**
- ⚠️ Fast Refresh working, but serving stale cached transforms
- Requires cache clear

**Strategy:**
```
1. Suspect Metro cache corruption
2. Try manual reload first: Press 'R'
3. If persists: npx expo start --clear
4. If still persists: Nuclear option (see below)
```

### Category E: Fast Refresh Limitations

**Examples:**
- Component state not preserved after edit
- Component remounts unexpectedly
- Changes to non-React exports

**Fast Refresh behavior:**
- ✅ Changes apply, but state resets
- This is expected behavior in certain cases

**When Fast Refresh resets state:**
```tsx
// ❌ Will reset state - file exports non-React code
export const API_URL = "https://api.example.com";
export default function MyComponent() { ... }

// ✅ Preserves state - only exports React components
export default function MyComponent() { ... }

// ✅ Alternative: Move constants to separate file
// constants.ts
export const API_URL = "https://api.example.com";
```

**Force full remount (useful for testing animations):**
```tsx
// @refresh reset

export default function AnimatedComponent() {
  // This component will fully remount on every save
  // Useful when you want to see mount animations repeatedly
}
```

## The Nuclear Option (Last Resort)

If everything is broken and nothing works:

```bash
# Windows PowerShell:
powershell.exe -Command "Remove-Item -Path 'node_modules' -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path '.expo' -Recurse -Force -ErrorAction SilentlyContinue"
npm install
npx expo start --clear

# Mac/Linux:
rm -rf node_modules .expo
npm install
npx expo start --clear
```

**This will:**
- Delete all installed packages
- Delete Expo cache
- Reinstall everything
- Clear Metro cache
- Restart dev server

**Use only when:**
- Multiple cache clears didn't work
- Dependency corruption suspected
- Expo CLI acting cursed
- Nothing else worked

## Fast Refresh vs Hot Reload (Terminology)

**Modern (Expo SDK 54):**
- ✅ **Fast Refresh** - Current system, enabled by default
- React Native 0.61+ standard
- Preserves component state
- Error resilient
- Works with hooks

**Legacy (deprecated):**
- ❌ **Hot Module Replacement (HMR)** - Old system
- Lost state on every reload
- Fragile with errors
- Manual intervention needed
- Expo doesn't use this anymore

**"Hot Reload" in Expo:**
- Expo mostly doesn't call it "Hot Reload" anymore
- Official term: **Fast Refresh**
- But it's the same concept as Next.js hot reload
- Expo docs say: "Reload is usually not necessary since Fast Refresh is enabled by default"

## Comparison: Expo vs Next.js

| Feature | Expo Fast Refresh | Next.js Fast Refresh |
|---------|------------------|---------------------|
| Auto reload on save | ✅ Yes (1-2 sec) | ✅ Yes (near instant) |
| Preserves state | ✅ Yes | ✅ Yes |
| Config changes | ❌ Need restart | ❌ Need restart |
| CSS/style changes | ✅ Auto reload | ✅ Auto reload |
| Error recovery | ✅ Automatic | ✅ Automatic |
| Native dependencies | ❌ Need rebuild | N/A (web only) |

**Expected experience:** Should feel identical to Next.js for React/TypeScript/style edits.

## Platform-Specific Notes

### Mobile (iOS/Android)

**Enable/Disable Fast Refresh:**
1. Shake device (or Cmd+D on iOS simulator, Cmd+M on Android emulator)
2. Tap "Enable Fast Refresh" (or "Disable" if already on)

**Reload manually:**
1. Shake device
2. Tap "Reload"

**Or:** Press `R` in Metro terminal (faster)

### Web (Browser)

**Enable/Disable Fast Refresh:**
- Fast Refresh enabled automatically in browser
- Standard browser hot reload behavior

**Reload manually:**
- Refresh browser (Cmd+R / Ctrl+R)
- Or press `R` in Metro terminal

**Launch web:**
```bash
npx expo start
# Then press 'W' in terminal to open browser
```

### WSL2 Users (Like You!)

**Common issue:** Watchman doesn't detect file changes reliably on WSL2.

**Symptoms:**
- Save file, but Metro doesn't show "Bundling..."
- Metro shows "100%" but changes don't appear
- Changes appear only after manual reload

**Solutions:**
```bash
# Option A: Press 'R' to reload manually
# (You'll do this frequently on WSL2)

# Option B: Reset Watchman periodically
watchman watch-del-all
watchman shutdown-server
npx expo start

# Option C: Use Windows-native development
# (Metro runs faster outside WSL2)
```

## Troubleshooting Flowchart

```
Changes not appearing?
│
├─ Is Metro running?
│  ├─ No → Start Metro: npx expo start
│  └─ Yes → Continue
│
├─ Is Fast Refresh enabled?
│  ├─ No → Shake device → Enable Fast Refresh
│  └─ Yes → Continue
│
├─ Did you modify config files?
│  ├─ Yes → Restart Metro: Ctrl+C → npx expo start
│  └─ No → Continue
│
├─ Did you install packages?
│  ├─ Yes → Restart Metro: Ctrl+C → npx expo start
│  └─ No → Continue
│
├─ Is this a native dependency?
│  ├─ Yes → Rebuild: npx expo run:ios
│  └─ No → Continue
│
├─ Try manual reload
│  └─ Press 'R' in Metro terminal
│
├─ Still not working?
│  └─ Clear cache: npx expo start --clear
│
└─ Still not working?
   └─ Nuclear option: Delete node_modules → npm install
```

## Expected Daily Workflow

**Morning:**
```bash
# Start once
npx expo start --ios
# or
npx expo start --android
```

**Throughout the day:**
```
Edit files → Save → Wait 1-2 sec → See changes

No restart needed!
```

**Only restart if:**
- Changed config files (babel, metro, tailwind, app.json)
- Installed new packages
- Fast Refresh stopped working (press 'R' first)
- Metro acting weird (try --clear flag)

**End of day:**
```bash
Ctrl+C  # Stop Metro
```

## Why You Might Feel Like Fast Refresh "Doesn't Exist"

Common reasons people end up restarting with `--clear` constantly:

### 1. Fast Refresh Got Turned Off
Check dev menu - there's literally a "Fast Refresh" toggle that can be accidentally disabled.

### 2. Changing Things That Require Restart
Not Fast Refresh's fault - config files require restart by design.

### 3. SDK 54 Fast Refresh Quirks
Some reported issues where Fast Refresh remounts more than expected. If you see "why did it jump back to home screen" - you're not crazy, it's a known quirk.

### 4. WSL2 Watchman Issues
File change detection is slower/unreliable on WSL2. This makes Fast Refresh feel broken even when it's working.

### 5. Using `--clear` as Default Habit
Breaking the habit: Start without `--clear` and only use it when Metro is actually stuck/cursed.

## Pro Tips

1. **Keep Metro running** - Don't restart between every file edit
2. **Press 'R' for manual reload** - Faster than restarting Metro
3. **Only use `--clear` when stuck** - Not for normal development
4. **Watch Metro terminal** - Shows bundling progress and errors
5. **Enable Fast Refresh** - Should always be ON during development
6. **Learn the keyboard shortcuts** - R (reload), M (menu), W (web)
7. **Check the dev menu** - Shake device regularly to verify Fast Refresh is ON

## Quick Reference

```bash
# Normal development
npx expo start              # Start once, edit forever
Press 'R'                   # Manual reload (fast)
Shake device → Reload       # Manual reload (slower)

# After config changes
Ctrl+C → npx expo start     # Restart Metro (no --clear)

# After Tailwind config or when Metro stuck
npx expo start --clear      # Clear cache and restart

# After installing packages
npm install some-package
Ctrl+C → npx expo start

# Native dependencies
npm install some-native-package
npx expo run:ios            # Rebuild required

# Nuclear option (last resort)
rm -rf node_modules .expo
npm install
npx expo start --clear
```

---

**Bottom line:** Fast Refresh should work like Next.js - save and see changes in 1-2 seconds. If you're constantly restarting or clearing cache, something is misconfigured. The goal is to start Metro once per day and just edit files.
