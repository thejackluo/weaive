# Complete Fix & Setup Guide for Expo SDK 54 + React Native 0.81

**Last Updated:** 2025-12-18
**Status:** ✅ Working Configuration Verified

---

## ✅ VERIFIED CONFIGURATION

Your current setup is **OFFICIALLY SUPPORTED** and working correctly:

| Package | Version | Status |
|---------|---------|--------|
| **React** | 19.1.0 | ✅ Required by RN 0.81+ |
| **React Native** | 0.81.5 | ✅ Latest stable |
| **Expo SDK** | 54.0.30 | ✅ Latest patch |
| **NativeWind** | 4.2.1 | ✅ Compatible with React 19 |
| **Tailwind CSS** | 3.4.19 | ✅ Required by NativeWind v4 |
| **Node.js** | 20.19.4+ | ✅ Minimum required |

**DO NOT DOWNGRADE REACT!** React 19 is required and supported.

---

## Quick Navigation

- [Fresh Setup (New Projects)](#fresh-setup-new-projects)
- [Upgrade Existing Project](#upgrade-existing-project)
- [Fix Broken Installation](#fix-broken-installation)
- [WSL/Windows Issues](#wslwindows-specific-issues)
- [Troubleshooting](#troubleshooting)

---

## Fresh Setup (New Projects)

If you're starting from scratch or want a clean slate:

### **From Windows PowerShell** (Recommended)

```powershell
# 1. Navigate to project
cd "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile"

# 2. Clean everything
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .expo -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue

# 3. Install latest packages
npx expo install expo@latest --fix

# 4. Verify installation
npx expo-doctor

# 5. Start app
npx expo start --clear
```

### **From WSL/Linux**

```bash
cd weave-mobile

# Clean everything
rm -rf node_modules .expo package-lock.json

# Install latest packages
npx expo install expo@latest --fix

# Verify
npx expo-doctor

# Start
npx expo start --clear
```

---

## Upgrade Existing Project

To update all packages to their latest compatible versions:

### **Step 1: Close Everything**

Before starting:
- ✅ Close VS Code
- ✅ Stop Metro bundler (Ctrl+C in terminal)
- ✅ Close Android Studio / Xcode
- ✅ Close any running terminals

**Why?** These programs may lock files and cause permission errors.

### **Step 2: Run Upgrade Command**

**From Windows PowerShell:**
```powershell
cd "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile"
npx expo install expo@latest --fix
```

**From WSL:**
```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weavelight/weave-mobile
npx expo install expo@latest --fix
```

### **Step 3: Verify Success**

```bash
npx expo-doctor
```

**Expected Output:**
```
✔ Check Expo config for common issues
✔ Check package.json for common issues
✔ Check dependencies for packages that should not be installed directly
✔ Check for issues with metro config
✔ Check npm/ yarn/ pnpm versions
✔ Check Expo config (app.json/ app.config.js) schema
✔ Check that packages match versions required by installed Expo SDK
✔ Check that native modules do not use incompatible support packages

Didn't find any issues with the project!
```

### **Step 4: Test App**

```bash
npx expo start --clear
```

---

## Fix Broken Installation

If your installation is broken, follow these steps:

### **Option 1: Nuclear Clean Install** (Most Reliable)

**From Windows PowerShell:**
```powershell
cd "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile"

# Step 1: Delete everything
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .expo -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue

# Step 2: Fresh install
npx expo install expo@latest --fix

# Step 3: Verify
npx expo-doctor

# Step 4: Start
npx expo start --clear
```

**From WSL:**
```bash
cd weave-mobile

# Step 1: Delete everything
rm -rf node_modules .expo package-lock.json

# Step 2: Fresh install
npx expo install expo@latest --fix

# Step 3: Verify
npx expo-doctor

# Step 4: Start
npx expo start --clear
```

### **Option 2: Fix Without Deleting**

If you want to preserve your current installation:

```bash
# 1. Fix peer dependencies
npx expo install --fix

# 2. Verify installation
npx expo-doctor

# 3. Clear cache and start
npx expo start --clear
```

---

## WSL/Windows Specific Issues

### **Issue: Permission Denied (EACCES)**

**Error Message:**
```
npm error code EACCES
npm error syscall rename
npm error errno -13
npm error Error: EACCES: permission denied
```

**Root Cause:**
WSL can't rename files on Windows filesystem (NTFS) due to file locking.

**Solution 1: Use PowerShell** (Recommended)
```powershell
# Open Windows PowerShell (NOT WSL)
cd "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile"

# Delete node_modules
Remove-Item -Path node_modules -Recurse -Force

# Reinstall
npx expo install expo@latest --fix
```

**Solution 2: Run PowerShell as Administrator**
1. Press `Windows + X`
2. Select **"Windows PowerShell (Admin)"**
3. Click "Yes" when prompted
4. Run the commands above

**Solution 3: Fix from WSL**
```bash
# Delete everything
cd weave-mobile
rm -rf node_modules .expo package-lock.json

# Reinstall
npx expo install expo@latest --fix
```

---

## Configuration Files

### **babel.config.js** ✅

**Current Configuration (NativeWind v4):**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/design-system': '../src/design-system',
            app: './app',
          },
        },
      ],
    ],
  };
};
```

**Important:**
- ✅ Include `jsxImportSource: 'nativewind'` for React 19
- ✅ Include `'nativewind/babel'` preset
- ✅ Keep `module-resolver` for path aliases

### **metro.config.js** ✅

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

### **global.css** ✅

**NativeWind v4 Format:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import "nativewind/theme";
```

**Alternative (Tailwind v4 Format):**
```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";
```

### **package.json** ✅

**Key Dependencies:**
```json
{
  "dependencies": {
    "expo": "~54.0.30",
    "expo-router": "~6.0.21",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.2.1",
    "react-native-worklets-core": "^1.6.2",
    "nativewind": "^4.2.1",
    "@tanstack/react-query": "^5.90.12",
    "@supabase/supabase-js": "^2.88.0",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.19",
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  }
}
```

---

## Troubleshooting

### **Metro Bundler Issues**

**Error: "Unable to resolve module"**

```bash
# Clear Metro cache
npx expo start --clear

# If that doesn't work, nuclear option:
npx expo start --clear --reset-cache
```

**Error: "Port 8081 already in use"**

```bash
# Find and kill the process
# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process

# On WSL/Linux:
lsof -ti:8081 | xargs kill -9

# Then restart:
npx expo start
```

### **Babel/Transform Errors**

**Error: "Cannot find module 'babel-preset-expo'"**

```bash
# Reinstall Babel dependencies
npm install --save-dev babel-preset-expo@latest

# Clear cache and restart
npx expo start --clear
```

**Error: "Plugin validation failed"**

This usually means your `babel.config.js` is malformed.

**Solution:**
1. Check for syntax errors (missing commas, brackets)
2. Verify the file matches the example above
3. Restart Metro after fixing

### **NativeWind Styling Not Working**

**Symptoms:** Tailwind classes don't apply visually

**Checklist:**
- [ ] Is `@import "nativewind/theme"` in `global.css`?
- [ ] Is `withNativeWind` wrapping config in `metro.config.js`?
- [ ] Is `jsxImportSource: 'nativewind'` in `babel.config.js`?
- [ ] Did you restart Metro after config changes?

**Fix:**
```bash
# Verify config files match examples above
# Then:
npx expo start --clear
```

### **Worklets Version Mismatch**

**Error:** `WorkletsError: Mismatch between JavaScript and native`

**Solution:**
```bash
# Explicitly install worklets
npx expo install react-native-worklets-core

# Verify
npx expo-doctor

# Restart
npx expo start --clear
```

### **Peer Dependency Warnings**

**Warning:** `npm WARN peer dependency...`

**Solution:**
```bash
# Let Expo fix it automatically
npx expo install --fix

# Verify no issues
npx expo-doctor
```

### **React 19 Compatibility Concerns**

**Question:** "Should I downgrade to React 18?"

**Answer:** **NO!** React 19 is required and officially supported by:
- React Native 0.81+ ✅
- Expo SDK 54 ✅
- NativeWind 4.x ✅
- All major libraries ✅

Downgrading will break your app.

---

## Package Upgrade Reference

### **What Gets Updated**

Running `npx expo install expo@latest --fix` updates:

| Package | From | To | Change Type |
|---------|------|----|----|
| expo | 54.0.29 | 54.0.30 | Patch (bug fixes) |
| expo-router | 6.0.20 | 6.0.21 | Patch |
| react-native-reanimated | 4.1.1 | 4.2.1 | Minor (new features) |
| + related packages | - | Latest | Auto-updated |

**Total:** ~15 packages updated

### **Semver Ranges Explained**

| Prefix | Meaning | Example | Allows |
|--------|---------|---------|--------|
| **~** | Patch updates only | ~54.0.29 | 54.0.30, 54.0.31 |
| **^** | Minor + Patch | ^4.2.1 | 4.2.2, 4.3.0 |
| **(none)** | Exact version | 19.1.0 | Only 19.1.0 |

**Expo convention:**
- Core packages (expo, expo-router): Use **~** (safe, patch-only)
- Community packages: Use **^** (more flexible)
- React/React Native: Use **exact** (critical dependencies)

---

## Version History & Known Issues

### **Current Working Versions** (2025-12-18)

```json
{
  "expo": "~54.0.30",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-router": "~6.0.21",
  "react-native-reanimated": "~4.2.1",
  "nativewind": "^4.2.1",
  "tailwindcss": "^3.4.19"
}
```

### **Resolved Issues**

✅ **React 19 "Incompatibility"** (2025-12-17)
- **Myth:** React 19 doesn't work with React Native
- **Truth:** React Native 0.81+ requires React 19
- **Status:** Working correctly

✅ **Worklets Version Mismatch** (2025-12-18)
- **Issue:** JS 0.7.1 vs Native 0.5.1 mismatch
- **Fix:** Explicit install via `npx expo install`
- **Status:** Resolved

✅ **NativeWind v4 Configuration** (2025-12-17)
- **Issue:** Incorrect Babel/Metro config
- **Fix:** Added proper `jsxImportSource` and preset
- **Status:** Working correctly

### **Known Limitations**

⚠️ **NativeWind v5** (Preview)
- Requires Tailwind CSS v4.1.11+
- Breaking changes from v4
- **Recommendation:** Stay on v4 until v5 is stable

⚠️ **WSL File Permissions**
- npm may fail with EACCES on Windows filesystem
- **Workaround:** Use PowerShell or delete node_modules first

---

## Development Workflow

### **Daily Development**

```bash
# Start Metro (keep running)
npx expo start

# Make code changes
# Metro automatically reloads in 1-2 seconds

# Only restart Metro if you change:
# - babel.config.js
# - metro.config.js
# - tailwind.config.js
# - Install new packages
```

### **After Installing Packages**

```bash
# Always use expo install for native modules
npx expo install <package-name>

# Then restart with clean cache
npx expo start --clear
```

### **Before Committing**

```bash
# Verify everything works
npx expo-doctor

# Run linting
npm run lint

# Test on both platforms if possible
npx expo start --ios
npx expo start --android
```

---

## Prevention Best Practices

### **1. Always Use `npx expo install`**

```bash
# ✅ Good - Handles peer dependencies
npx expo install react-native-maps

# ❌ Bad - May install incompatible versions
npm install react-native-maps
```

### **2. Commit package-lock.json**

```bash
git add package-lock.json
git commit -m "chore: lock dependency versions"
```

**Why?** Ensures consistent installs across machines and CI/CD.

### **3. Use `npm ci` in Production**

```bash
# In CI/CD pipelines, use:
npm ci  # Installs from lock file, faster

# NOT:
npm install  # May update versions
```

### **4. Regular Updates**

```bash
# Check for updates weekly
npx expo install --fix

# Verify after updates
npx expo-doctor
```

### **5. Test Clean Installs**

```bash
# Once a week, test fresh install
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

---

## Quick Reference

### **One-Liner Fixes**

```bash
# Fix peer dependencies
npx expo install --fix

# Clear all caches
npx expo start --clear --reset-cache

# Nuclear reinstall
rm -rf node_modules package-lock.json && npm install

# Verify everything
npx expo-doctor
```

### **Useful Commands**

```bash
# Check installed versions
npm ls expo react react-native

# View package info
npm view expo versions

# Check Node version
node --version

# Check npm version
npm --version
```

---

## Getting Help

If you're still stuck after trying these steps:

1. **Run diagnostics:**
   ```bash
   npx expo-doctor
   node check-versions.js  # Custom diagnostic script
   ```

2. **Check logs:**
   - Metro bundler output
   - `~/.npm/_logs/` (npm errors)
   - Device/simulator logs

3. **Common solutions:**
   - Close VS Code, restart Metro
   - Delete node_modules and reinstall
   - Use PowerShell instead of WSL
   - Run as Administrator

4. **Resources:**
   - [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
   - [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
   - [NativeWind Docs](https://www.nativewind.dev/)

---

**Last Updated:** 2025-12-18
**Verified Working:** ✅ Windows 11 + WSL2 + PowerShell
