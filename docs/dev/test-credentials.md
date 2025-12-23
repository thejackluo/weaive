# Test Credentials for Development

## Primary Test Account

Use this account for consistent development testing across the team:

**Email:** `test.weave@anthropic.com`
**Password:** `Test1234!`
**User ID:** `f55cabd7-ee5d-4109-af9e-6baa94726295`

**Status:**
- ✅ Onboarding completed
- ✅ User profile created
- ✅ Ready for testing

## When to Use

Use this account for:
- Manual testing of new features
- Testing auth flows
- Testing goal/bind creation
- Testing dashboard visualizations
- Verifying API endpoints

## Resetting Test Data

If test data gets corrupted, you can:

1. **Soft reset** (keep user, clear goals):
   ```sql
   -- Via Supabase SQL Editor
   DELETE FROM goals WHERE user_id = (SELECT id FROM user_profiles WHERE auth_user_id = 'f55cabd7-ee5d-4109-af9e-6baa94726295');
   ```

2. **Hard reset** (delete user, re-run script):
   ```bash
   # Delete user via Supabase Dashboard → Authentication → Users
   # Then re-run:
   cd weave-api && uv run python ../scripts/create-test-user.py
   ```

## Creating Additional Test Users

If you need additional test accounts:

```bash
cd weave-api
uv run python ../scripts/create-test-user.py
# Edit the script to change email/password first
```

## Security Notes

⚠️ **Never commit real user credentials to version control**

- This test account is for **local development only**
- Production uses real Supabase auth with secure password hashing
- Test password is intentionally simple for dev convenience

## Backend Testing

For automated backend tests, use the factory users in `tests/conftest.py`:

```python
from tests.factories import create_test_user_with_profile

def test_my_feature(client):
    user, profile = create_test_user_with_profile()
    token = create_test_jwt(user.id)
    # Test logic...
```

Backend tests use ephemeral test users that are cleaned up after each test run.
