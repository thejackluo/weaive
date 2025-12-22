# Count Lines of Code

**Purpose:** Accurately count lines of code in the project, excluding caches, build artifacts, and generated files.

---

## Quick Command (Recommended)

### Option 1: Using `sloc` (JavaScript-based, no Perl required)

```powershell
npx sloc . `
  --exclude "node_modules,__pycache__,.expo,.expo-shared,dist,build,.next,coverage,.turbo,.cache,htmlcov,.pytest_cache,.venv,venv,env,ENV,lib64,parts,sdist,var,wheels,develop-eggs,eggs,.eggs,downloads,_bmad,bmad-custom-modules-src,bmad-custom-src,.bmad,.claude,.codex,.cursor,.agentvibes,.vscode,.idea,ios,android,.kotlin,coverage" `
  --format json `
  --output cloc.json
```

### Option 2: Using `cloc` (requires Perl)

**Prerequisites:** Install Perl (Strawberry Perl or ActivePerl) or use WSL.

```powershell
npx cloc . `
  --exclude-dir=node_modules,__pycache__,.expo,.expo-shared,dist,build,.next,coverage,.turbo,.cache,htmlcov,.pytest_cache,.venv,venv,env,ENV,lib64,parts,sdist,var,wheels,develop-eggs,eggs,.eggs,downloads,_bmad,bmad-custom-modules-src,bmad-custom-src,.bmad,.claude,.codex,.cursor,.agentvibes,.vscode,.idea,ios,android,.kotlin `
  --exclude-ext=lock,log,lcov,xml,egg-info,pyc,pyo,pyd,so,swp,swo,DS_Store,orig `
  --include-ext=ts,tsx,js,jsx,py,sql,json,yaml,yml,toml,config.js,config.mjs,html,css,md `
  --json `
  --out cloc.json
```

### Option 3: Using WSL (if Perl is installed in WSL)

```bash
wsl npx cloc . \
  --exclude-dir=node_modules,__pycache__,.expo,.expo-shared,dist,build,.next,coverage,.turbo,.cache,htmlcov,.pytest_cache,.venv,venv,env,ENV,lib64,parts,sdist,var,wheels,develop-eggs,eggs,.eggs,downloads,_bmad,bmad-custom-modules-src,bmad-custom-src,.bmad,.claude,.codex,.cursor,.agentvibes,.vscode,.idea,ios,android,.kotlin \
  --exclude-ext=lock,log,lcov,xml,egg-info,pyc,pyo,pyd,so,swp,swo,DS_Store,orig \
  --include-ext=ts,tsx,js,jsx,py,sql,json,yaml,yml,toml,config.js,config.mjs,html,css,md \
  --json \
  --out cloc.json
```

---

## What's Included

### Source Code Files
- **TypeScript/JavaScript:** `.ts`, `.tsx`, `.js`, `.jsx`
- **Python:** `.py`
- **SQL:** `.sql`
- **Configuration:** `.json`, `.yaml`, `.yml`, `.toml`, `.config.js`, `.config.mjs`
- **Styles:** `.css`
- **Markdown:** `.md` (documentation)
- **HTML:** `.html`

### Excluded Directories
- **Dependencies:** `node_modules`, Python virtual environments
- **Build artifacts:** `dist`, `build`, `.next`, `web-build`
- **Caches:** `__pycache__`, `.expo`, `.expo-shared`, `.cache`, `.turbo`, `.pytest_cache`
- **Coverage reports:** `coverage`, `htmlcov`
- **IDE/Editor:** `.vscode`, `.idea`
- **Agentic tools:** `_bmad`, `bmad-custom-*`, `.bmad`, `.claude`, `.codex`, `.cursor`
- **Native builds:** `ios`, `android`, `.kotlin`
- **Python artifacts:** `lib64`, `parts`, `sdist`, `var`, `wheels`, `*.egg-info`

### Excluded File Extensions
- **Lock files:** `.lock` (package-lock.json, uv.lock)
- **Logs:** `.log`
- **Coverage:** `.lcov`, `.xml` (coverage reports)
- **Python bytecode:** `.pyc`, `.pyo`, `.pyd`
- **Temporary:** `.swp`, `.swo`, `.DS_Store`, `.orig`

---

## Usage Examples

### Count Only Source Code (No Documentation)

```powershell
npx sloc . `
  --exclude "node_modules,__pycache__,.expo,.expo-shared,dist,build,.next,coverage,.turbo,.cache,htmlcov,.pytest_cache,.venv,venv,env,ENV,lib64,parts,sdist,var,wheels,develop-eggs,eggs,.eggs,downloads,_bmad,bmad-custom-modules-src,bmad-custom-src,.bmad,.claude,.codex,.cursor,.agentvibes,.vscode,.idea,ios,android,.kotlin,coverage,docs" `
  --format json `
  --output cloc-source-only.json
```

### Count by Component

```powershell
# Mobile app only
npx sloc weave-mobile `
  --exclude "node_modules,.expo,dist,coverage,ios,android" `
  --format json `
  --output cloc-mobile.json

# API only
npx sloc weave-api `
  --exclude "__pycache__,.venv,venv,coverage,htmlcov" `
  --format json `
  --output cloc-api.json

# Supabase migrations only
npx sloc supabase/migrations `
  --format json `
  --output cloc-migrations.json
```

### View Results

```powershell
# View JSON output
Get-Content cloc.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Or use jq (if installed)
cat cloc.json | jq .
```

---

## Alternative Tools

### `tokei` (Rust-based, very fast)

```powershell
# Install via cargo
cargo install tokei

# Or download from: https://github.com/XAMPPRocky/tokei/releases
tokei --exclude node_modules --exclude __pycache__ --exclude .expo --exclude dist --exclude build --exclude coverage
```

### `loc` (Go-based)

```powershell
# Install via go
go install github.com/cgag/loc@latest

# Run
loc --exclude node_modules,__pycache__,.expo,dist,build,coverage
```

---

## Notes

- **Lock files** (`package-lock.json`, `uv.lock`) are excluded as they're generated
- **Coverage reports** are excluded to count only source code
- **Documentation** (`.md` files) is included by default; exclude `docs` directory if you want source code only
- **Test files** are included (they're real code)
- **Configuration files** are included (they're part of the project)

---

## Troubleshooting

### "perl is not recognized"
- Install Perl (Strawberry Perl or ActivePerl) and add to PATH
- Or use `sloc` instead (JavaScript-based, no Perl required)
- Or use WSL if Perl is installed there

### Results seem too high
- Check if coverage reports or build artifacts are being included
- Verify exclude directories are working: `npx sloc . --exclude "node_modules" --format cli-table`

### Results seem too low
- Check if source directories are being excluded by mistake
- Verify include extensions match your file types

