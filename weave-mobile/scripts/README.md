# Frontend Scripts

Utility scripts for managing the Weave mobile app.

## hard-reset.sh / hard-reset.ps1

**Nuclear option for fixing cache/dependency issues**

Performs a complete reset of the development environment:
- Stops watchman
- Deletes `.expo/` cache
- Deletes `node_modules/`
- Deletes `package-lock.json`
- Clears Metro bundler cache (`/tmp/metro-*`)
- Clears Haste map cache (`/tmp/haste-map-*`)
- Clears Expo cache (`~/.expo/cache`)
- Clears npm cache
- Reinstalls all dependencies
- Starts clean dev server with full cache reset

### Usage

**Mac/Linux/WSL:**
```bash
cd weave-mobile
npm run hard-reset
# or
./scripts/hard-reset.sh
```

**Windows PowerShell:**
```powershell
cd weave-mobile
.\scripts\hard-reset.ps1
```

### When to Use

Use this when experiencing:
- ❌ "unmatched route" errors after adding new files
- ❌ Metro not picking up new files or routes
- ❌ Import errors that don't make sense
- ❌ Stale cache causing incorrect behavior
- ❌ Dependency conflicts or version mismatches
- ❌ "Cannot find module" errors after installing packages

### Differences vs. `npm run reset`

| Command | Clears | Time | When to Use |
|---------|--------|------|-------------|
| `npm start -- --clear` | Metro cache only | ~10s | Quick cache clear |
| `npm run reset` | watchman + node_modules | ~2-3 min | Dependency updates |
| `npm run hard-reset` | **EVERYTHING** | ~3-5 min | Last resort / Nuclear option |

## Tips

- **Always commit/stash changes** before running hard-reset
- **Hard reset is not needed often** - try `npm start -- --clear` first
- **On Windows**, use PowerShell (not Command Prompt) for the script
- **On WSL**, use the bash version even though you're on Windows
