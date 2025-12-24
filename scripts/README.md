# Scripts Directory

**Purpose:** Centralized location for all project automation scripts organized by category.

---

## 📁 Directory Structure

```
scripts/
├── database/        # Database setup, seeding, migrations, validation
├── testing/         # Test runners and security testing
├── verification/    # Setup verification and pre-deployment checks
└── dev/             # Development tools and utilities
```

---

## 📦 Database Scripts (`database/`)

**Purpose:** Database setup, test data seeding, migrations, and validation.

| Script | Purpose | Usage |
|--------|---------|-------|
| **setup-test-db.sh** | Set up local Supabase test database | `./scripts/database/setup-test-db.sh` |
| **setup-test-db.ps1** | Set up local Supabase test database (Windows) | PowerShell script |
| **db-status.ps1** | Check database status (Windows) | PowerShell script |
| **create-test-user.py** | Create test user in database | `uv run python scripts/database/create-test-user.py` |
| **create_test_goals.py** | Create test goals for user | `uv run python scripts/database/create_test_goals.py` |
| **setup-test-user-profile.py** | Set up test user profile | `uv run python scripts/database/setup-test-user-profile.py` |
| **seed-test-data.py** | Seed comprehensive test data | `uv run python scripts/database/seed-test-data.py` |
| **apply_story_0_9_migrations.py** | Apply Story 0.9 migrations | `uv run python scripts/database/apply_story_0_9_migrations.py` |
| **validate-database.sh** | Validate database schema and data | `./scripts/database/validate-database.sh` |
| **validate-database.ps1** | Validate database schema (Windows) | PowerShell script |

---

## 🧪 Testing Scripts (`testing/`)

**Purpose:** Test execution and security testing.

| Script | Purpose | Usage |
|--------|---------|-------|
| **test_rls_security.py** | RLS penetration testing (48 tests) | `uv run python scripts/testing/test_rls_security.py` |

**Note:** For comprehensive test suites, see `scripts/verification/run-all-tests.sh`.

---

## ✅ Verification Scripts (`verification/`)

**Purpose:** Pre-deployment verification, setup checks, and comprehensive test runners.

| Script | Purpose | Usage |
|--------|---------|-------|
| **pre-deployment-verification.sh** | 🚀 **Automated pre-deployment checks** | `./scripts/verification/pre-deployment-verification.sh` |
| **run-all-tests.sh** | Run all backend + mobile + RLS tests | `./scripts/verification/run-all-tests.sh` |
| **verify-ci-setup.sh** | Verify CI/CD configuration | `./scripts/verification/verify-ci-setup.sh` |
| **verify-mcp-setup.sh** | Verify MCP servers setup | `./scripts/verification/verify-mcp-setup.sh` |
| **verify-mcp-setup.ps1** | Verify MCP servers (Windows) | PowerShell script |

### Pre-Deployment Verification Script

**Most Important Script Before Production:**
```bash
./scripts/verification/pre-deployment-verification.sh
```

**What it checks:**
- ✅ Backend tests pass
- ✅ Mobile TypeScript compiles
- ✅ Linting passes
- ✅ No secrets in code
- ✅ RLS migrations exist
- ✅ Railway config valid
- ✅ Health endpoint exists
- ✅ CI/CD workflow exists
- ✅ Documentation updated

**Exit codes:**
- `0` = Ready for deployment
- `1` = NOT ready (fix issues first)

---

## 🛠️ Development Scripts (`dev/`)

**Purpose:** Development utilities and tooling.

| Script | Purpose | Usage |
|--------|---------|-------|
| **setup-worktrees.ps1** | Set up Git worktrees (Windows) | PowerShell script |

---

## 🚀 Quick Reference

### Before Every Deployment
```bash
# 1. Run pre-deployment verification
./scripts/verification/pre-deployment-verification.sh

# 2. If all checks pass, run full test suite
./scripts/verification/run-all-tests.sh

# 3. Follow production deployment manual
# See: docs/production/production-deployment-manual.md
```

### Local Development Setup
```bash
# 1. Set up local Supabase database
./scripts/database/setup-test-db.sh

# 2. Seed test data
cd weave-api
uv run python scripts/database/seed-test-data.py

# 3. Verify database
./scripts/database/validate-database.sh
```

### Security Testing
```bash
# 1. Start local Supabase
npx supabase start

# 2. Apply migrations
npx supabase db push

# 3. Run RLS penetration tests
cd weave-api
uv run python scripts/testing/test_rls_security.py

# Expected: 0 successful attacks, 24 blocked
```

---

## 📝 Script Conventions

### Naming
- **Bash scripts:** `kebab-case.sh` (e.g., `setup-test-db.sh`)
- **PowerShell scripts:** `kebab-case.ps1` (e.g., `setup-test-db.ps1`)
- **Python scripts:** `snake_case.py` (e.g., `test_rls_security.py`)

### Executability
All bash scripts should be executable:
```bash
chmod +x scripts/**/*.sh
```

### Documentation
Each script should have:
- Header comment explaining purpose
- Usage instructions
- Required environment variables (if any)
- Example output

---

## 🔧 Adding New Scripts

When adding new scripts:

1. **Choose the right category:**
   - Database operations → `database/`
   - Test execution → `testing/`
   - Verification/validation → `verification/`
   - Development tools → `dev/`

2. **Follow naming conventions:**
   - Bash: `kebab-case.sh`
   - Python: `snake_case.py`
   - PowerShell: `kebab-case.ps1`

3. **Make executable (bash scripts):**
   ```bash
   chmod +x scripts/category/new-script.sh
   ```

4. **Add to this README:**
   - Update the appropriate section
   - Include purpose and usage

5. **Test locally before committing:**
   ```bash
   ./scripts/category/new-script.sh
   ```

---

## ⚠️ Important Notes

### Environment Variables
Many scripts require environment variables. Check each script's header for required vars.

**Common variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `PRODUCTION_API_URL` (for deployment tests)

### Windows Users
Use PowerShell scripts (`.ps1`) instead of bash scripts (`.sh`).

### CI/CD Integration
Verification scripts are designed for CI/CD integration:
```yaml
# Example GitHub Actions step
- name: Pre-deployment verification
  run: ./scripts/verification/pre-deployment-verification.sh
```

---

## 📚 Related Documentation

- **Production Deployment:** `docs/production/production-deployment-manual.md`
- **Test Validation:** `docs/production/test-validation-guide-DRAFT.md`
- **Pre-Deployment Verification:** `docs/production/pre-deployment-verification.md`
- **Database Setup:** `docs/dev/database-setup-guide.md` (if exists)

---

**Last Updated:** 2025-12-23
**Maintained By:** Engineering Team
