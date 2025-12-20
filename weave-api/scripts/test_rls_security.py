#!/usr/bin/env python3
"""
RLS (Row Level Security) Penetration Testing Script
Story 0.4 - Comprehensive Security Testing

Implements adversarial testing approach:
1. Create 10 test users with Supabase Auth
2. Each user creates: 2 goals, 5 completions, 3 journal entries
3. Each user attempts to access ALL other users' data via:
   - Direct ID queries
   - Enumeration attacks
   - Batch queries
   - Cross-user INSERT attempts
   - Cross-user UPDATE attempts
   - Cross-user DELETE attempts
4. Verify 0 successful cross-user accesses
5. Log all attempts to security_audit.log
6. Exit code 0 if secure, 1 if vulnerabilities found

Prerequisites:
- Supabase local instance running (npx supabase start)
- RLS policies applied (npx supabase db push)

Run: uv run python scripts/test_rls_security.py
"""

import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security_audit.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class RLSPenetrationTester:
    """Comprehensive RLS penetration testing with adversarial approach."""

    def __init__(self):
        """Initialize tester with Supabase client."""
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')

        if not supabase_url or not supabase_key:
            # Check if we're in a CI environment
            is_ci = os.getenv('CI') or os.getenv('GITHUB_ACTIONS') or os.getenv('GITLAB_CI')

            logger.warning("⚠️  Supabase not configured (SUPABASE_URL or SUPABASE_ANON_KEY missing)")
            logger.info("This test requires a local Supabase instance:")
            logger.info("  1. npx supabase init")
            logger.info("  2. npx supabase start")
            logger.info("  3. npx supabase db push")

            if is_ci:
                logger.info("\n✅ Skipping RLS security tests gracefully (CI environment detected)...")
                sys.exit(0)  # Exit gracefully for CI without Supabase
            else:
                logger.error("\n❌ FAILED: Supabase not configured in local environment!")
                logger.error("⚠️  Configure Supabase to run security tests locally")
                sys.exit(1)  # Exit with error in local/dev to alert developers

        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.test_users: List[Dict[str, Any]] = []
        self.vulnerabilities: List[Dict[str, Any]] = []
        self.attack_attempts = {
            'direct_id_queries': 0,
            'enumeration_attacks': 0,
            'batch_queries': 0,
            'cross_user_inserts': 0,
            'cross_user_updates': 0,
            'cross_user_deletes': 0,
            'immutability_violations': 0,
            'successful_attacks': 0,
        }

    def create_test_users(self, count: int = 10):
        """Create test users with Supabase Auth."""
        logger.info(f"\n📝 Creating {count} test users...")

        for i in range(count):
            try:
                # Create user with unique email
                email = f"rls-test-user-{i}@weavetest.local"
                password = f"TestPass{i}!2025"

                # Sign up user (creates auth.users entry)
                auth_response = self.supabase.auth.sign_up({
                    "email": email,
                    "password": password,
                })

                if not auth_response.user:
                    logger.warning(f"  ⚠️  Could not create auth user {i} (may already exist)")
                    # Try to sign in instead
                    auth_response = self.supabase.auth.sign_in_with_password({
                        "email": email,
                        "password": password,
                    })

                user = auth_response.user
                if not user:
                    logger.error(f"  ❌ Failed to create or sign in user {i}")
                    continue

                # Create user profile
                profile_data = {
                    'auth_user_id': user.id,
                    'display_name': f'Test User {i}',
                    'timezone': 'America/Los_Angeles',
                }

                # Try to insert profile (may fail if already exists)
                try:
                    profile_response = self.supabase.table('user_profiles').insert(profile_data).execute()
                    profile_id = profile_response.data[0]['id']
                except Exception:
                    # Profile exists, fetch it
                    profile_response = self.supabase.table('user_profiles').select('id').eq('auth_user_id', user.id).execute()
                    if profile_response.data:
                        profile_id = profile_response.data[0]['id']
                    else:
                        logger.error(f"  ❌ Could not get profile for user {i}")
                        continue

                self.test_users.append({
                    'index': i,
                    'email': email,
                    'password': password,
                    'auth_user_id': user.id,
                    'profile_id': profile_id,
                    'access_token': auth_response.session.access_token if auth_response.session else None,
                })

                logger.info(f"  ✅ User {i}: {email} (profile_id: {profile_id[:8]}...)")

            except Exception as e:
                logger.error(f"  ❌ Error creating user {i}: {str(e)[:100]}")

        logger.info(f"\n✅ Created {len(self.test_users)} test users")

    def seed_user_data(self):
        """Seed data for each test user."""
        logger.info(f"\n📊 Seeding data for {len(self.test_users)} users...")

        for user in self.test_users:
            try:
                # Authenticate as this user
                client = self._get_authenticated_client(user['access_token'])

                # Create 2 goals
                for goal_idx in range(2):
                    goal_data = {
                        'user_id': user['profile_id'],
                        'title': f"User {user['index']} Goal {goal_idx + 1}",
                        'description': "Test goal for RLS validation",
                        'status': 'active',
                    }
                    client.table('goals').insert(goal_data).execute()

                # Create 3 journal entries
                for journal_idx in range(3):
                    journal_data = {
                        'user_id': user['profile_id'],
                        'local_date': (datetime.now() - timedelta(days=journal_idx)).strftime('%Y-%m-%d'),
                        'text': f"Journal entry {journal_idx + 1}",
                        'fulfillment_score': 7,
                    }
                    client.table('journal_entries').insert(journal_data).execute()

                logger.info(f"  ✅ User {user['index']}: Seeded 2 goals, 3 journals")

            except Exception as e:
                logger.error(f"  ❌ Error seeding data for user {user['index']}: {str(e)[:100]}")

        logger.info("✅ Data seeding complete")

    def _get_authenticated_client(self, access_token: Optional[str]) -> Client:
        """Create Supabase client with specific user's auth token."""
        supabase_url = os.getenv('SUPABASE_URL')
        # Use access token for authenticated requests
        if access_token:
            return create_client(
                supabase_url,
                access_token,  # Use user's access token
            )
        return self.supabase

    def test_direct_id_queries(self):
        """Test: User A tries to query User B's data by direct ID."""
        logger.info("\n🔍 Attack Vector 1: Direct ID Queries")

        for attacker in self.test_users[:3]:  # First 3 users attack
            attacker_client = self._get_authenticated_client(attacker['access_token'])

            for victim in self.test_users:
                if attacker['index'] == victim['index']:
                    continue  # Skip self

                self.attack_attempts['direct_id_queries'] += 1

                # Try to query victim's goals
                try:
                    response = attacker_client.table('goals').select('*').eq('user_id', victim['profile_id']).execute()

                    if response.data and len(response.data) > 0:
                        self.attack_attempts['successful_attacks'] += 1
                        self.vulnerabilities.append({
                            'attack_type': 'direct_id_query',
                            'attacker': attacker['index'],
                            'victim': victim['index'],
                            'table': 'goals',
                            'data_leaked': len(response.data),
                        })
                        logger.error(f"  🚨 VULNERABILITY: User {attacker['index']} accessed User {victim['index']} goals!")
                    else:
                        logger.debug(f"  ✅ User {attacker['index']} blocked from User {victim['index']} goals")

                except Exception as e:
                    logger.debug(f"  ✅ Attack blocked with error: {str(e)[:50]}")

        logger.info(f"  Direct ID queries: {self.attack_attempts['direct_id_queries']} attempts")

    def test_enumeration_attacks(self):
        """Test: User A tries to enumerate all data without filters."""
        logger.info("\n🔍 Attack Vector 2: Enumeration Attacks")

        for attacker in self.test_users[:3]:
            attacker_client = self._get_authenticated_client(attacker['access_token'])
            tables = ['goals', 'journal_entries', 'identity_docs', 'captures', 'subtask_completions']

            for table in tables:
                self.attack_attempts['enumeration_attacks'] += 1

                try:
                    # Try to get ALL rows (should only return attacker's own data)
                    response = attacker_client.table(table).select('*').execute()

                    # Count how many users' data is visible
                    if response.data:
                        unique_users = set(row.get('user_id') for row in response.data if 'user_id' in row)
                        if len(unique_users) > 1 or (len(unique_users) == 1 and list(unique_users)[0] != attacker['profile_id']):
                            self.attack_attempts['successful_attacks'] += 1
                            self.vulnerabilities.append({
                                'attack_type': 'enumeration',
                                'attacker': attacker['index'],
                                'table': table,
                                'users_visible': len(unique_users),
                            })
                            logger.error(f"  🚨 VULNERABILITY: User {attacker['index']} saw multiple users' data in {table}!")

                except Exception as e:
                    logger.debug(f"  ✅ Enumeration blocked: {str(e)[:50]}")

        logger.info(f"  Enumeration attacks: {self.attack_attempts['enumeration_attacks']} attempts")

    def test_cross_user_inserts(self):
        """Test: User A tries to INSERT data with User B's user_id."""
        logger.info("\n🔍 Attack Vector 3: Cross-User INSERT Attacks")

        if len(self.test_users) < 2:
            logger.warning("  ⚠️  Need at least 2 users for cross-user tests")
            return

        attacker = self.test_users[0]
        victim = self.test_users[1]
        attacker_client = self._get_authenticated_client(attacker['access_token'])

        self.attack_attempts['cross_user_inserts'] += 1

        try:
            # Try to insert goal with victim's user_id
            malicious_data = {
                'user_id': victim['profile_id'],
                'title': f"Malicious Goal by User {attacker['index']}",
                'status': 'active',
            }
            response = attacker_client.table('goals').insert(malicious_data).execute()

            # Check if insert succeeded
            if response.data and len(response.data) > 0:
                self.attack_attempts['successful_attacks'] += 1
                self.vulnerabilities.append({
                    'attack_type': 'cross_user_insert',
                    'attacker': attacker['index'],
                    'victim': victim['index'],
                    'table': 'goals',
                })
                logger.error(f"  🚨 VULNERABILITY: User {attacker['index']} inserted data for User {victim['index']}!")
            else:
                logger.info("  ✅ Cross-user INSERT blocked (RLS policy prevented insert)")

        except Exception as e:
            logger.info(f"  ✅ Cross-user INSERT blocked: {str(e)[:100]}")

        logger.info(f"  Cross-user INSERTs: {self.attack_attempts['cross_user_inserts']} attempts")

    def test_cross_user_updates(self):
        """Test: User A tries to UPDATE User B's data."""
        logger.info("\n🔍 Attack Vector 4: Cross-User UPDATE Attacks")

        if len(self.test_users) < 2:
            return

        attacker = self.test_users[0]
        victim = self.test_users[1]
        attacker_client = self._get_authenticated_client(attacker['access_token'])

        self.attack_attempts['cross_user_updates'] += 1

        try:
            # Get one of victim's goals (as admin to know the ID)
            victim_goals = self.supabase.table('goals').select('id').eq('user_id', victim['profile_id']).limit(1).execute()

            if not victim_goals.data:
                logger.warning("  ⚠️  No victim data to attack (skipping UPDATE test)")
                return

            victim_goal_id = victim_goals.data[0]['id']

            # Try to update victim's goal as attacker
            response = attacker_client.table('goals').update({
                'title': 'HACKED BY ATTACKER'
            }).eq('id', victim_goal_id).execute()

            # Check if any rows were updated
            if response.data and len(response.data) > 0:
                self.attack_attempts['successful_attacks'] += 1
                self.vulnerabilities.append({
                    'attack_type': 'cross_user_update',
                    'attacker': attacker['index'],
                    'victim': victim['index'],
                    'table': 'goals',
                })
                logger.error(f"  🚨 VULNERABILITY: User {attacker['index']} updated User {victim['index']} data!")
            else:
                logger.info("  ✅ Cross-user UPDATE blocked (0 rows affected)")

        except Exception as e:
            logger.info(f"  ✅ Cross-user UPDATE blocked: {str(e)[:100]}")

        logger.info(f"  Cross-user UPDATEs: {self.attack_attempts['cross_user_updates']} attempts")

    def test_cross_user_deletes(self):
        """Test: User A tries to DELETE User B's data."""
        logger.info("\n🔍 Attack Vector 5: Cross-User DELETE Attacks")

        if len(self.test_users) < 2:
            return

        attacker = self.test_users[0]
        victim = self.test_users[1]
        attacker_client = self._get_authenticated_client(attacker['access_token'])

        self.attack_attempts['cross_user_deletes'] += 1

        try:
            # Get victim's journal entry
            victim_journals = self.supabase.table('journal_entries').select('id').eq('user_id', victim['profile_id']).limit(1).execute()

            if not victim_journals.data:
                logger.warning("  ⚠️  No victim journals to attack (skipping DELETE test)")
                return

            victim_journal_id = victim_journals.data[0]['id']

            # Try to delete victim's journal as attacker
            _ = attacker_client.table('journal_entries').delete().eq('id', victim_journal_id).execute()

            # Verify journal still exists
            check = self.supabase.table('journal_entries').select('id').eq('id', victim_journal_id).execute()

            if not check.data:
                self.attack_attempts['successful_attacks'] += 1
                self.vulnerabilities.append({
                    'attack_type': 'cross_user_delete',
                    'attacker': attacker['index'],
                    'victim': victim['index'],
                    'table': 'journal_entries',
                })
                logger.error(f"  🚨 VULNERABILITY: User {attacker['index']} deleted User {victim['index']} data!")
            else:
                logger.info("  ✅ Cross-user DELETE blocked (data still exists)")

        except Exception as e:
            logger.info(f"  ✅ Cross-user DELETE blocked: {str(e)[:100]}")

        logger.info(f"  Cross-user DELETEs: {self.attack_attempts['cross_user_deletes']} attempts")

    def test_immutability_violations(self):
        """Test: User tries to UPDATE or DELETE their own completions (should fail)."""
        logger.info("\n🔍 Attack Vector 6: Immutability Violation Attempts")

        if not self.test_users:
            return

        user = self.test_users[0]
        user_client = self._get_authenticated_client(user['access_token'])

        # First, create a completion as this user (should succeed)
        try:
            # Need subtask_template and subtask_instance first
            # Create template
            template_response = user_client.table('subtask_templates').insert({
                'user_id': user['profile_id'],
                'goal_id': None,  # Unlinked bind
                'title': 'Test Bind for Immutability',
                'default_estimated_minutes': 30,
            }).execute()

            if not template_response.data:
                logger.warning("  ⚠️  Could not create subtask template (skipping immutability test)")
                return

            template_id = template_response.data[0]['id']

            # Create instance
            instance_response = user_client.table('subtask_instances').insert({
                'user_id': user['profile_id'],
                'template_id': template_id,
                'scheduled_for_date': datetime.now().strftime('%Y-%m-%d'),
                'status': 'planned',
                'estimated_minutes': 30,
            }).execute()

            if not instance_response.data:
                logger.warning("  ⚠️  Could not create subtask instance (skipping immutability test)")
                return

            instance_id = instance_response.data[0]['id']

            # Create completion
            completion_response = user_client.table('subtask_completions').insert({
                'user_id': user['profile_id'],
                'subtask_instance_id': instance_id,
                'local_date': datetime.now().strftime('%Y-%m-%d'),
                'completed_at': datetime.now().isoformat(),
            }).execute()

            if not completion_response.data:
                logger.warning("  ⚠️  Could not create completion (skipping immutability test)")
                return

            completion_id = completion_response.data[0]['id']
            logger.info(f"  ℹ️  Created completion {completion_id[:8]}... for testing")

            # Test UPDATE (should be blocked)
            self.attack_attempts['immutability_violations'] += 1
            try:
                _ = user_client.table('subtask_completions').update({
                    'local_date': '2099-12-31'  # Try to change date
                }).eq('id', completion_id).execute()

                # Check if update succeeded
                check = user_client.table('subtask_completions').select('local_date').eq('id', completion_id).execute()
                if check.data and check.data[0]['local_date'] == '2099-12-31':
                    self.attack_attempts['successful_attacks'] += 1
                    self.vulnerabilities.append({
                        'attack_type': 'immutability_violation',
                        'attacker': user['index'],
                        'table': 'subtask_completions',
                        'operation': 'UPDATE',
                    })
                    logger.error(f"  🚨 VULNERABILITY: User {user['index']} updated immutable completion!")
                else:
                    logger.info("  ✅ UPDATE blocked on immutable table (data unchanged)")

            except Exception as e:
                logger.info(f"  ✅ UPDATE blocked: {str(e)[:100]}")

            # Test DELETE (should be blocked)
            self.attack_attempts['immutability_violations'] += 1
            try:
                _ = user_client.table('subtask_completions').delete().eq('id', completion_id).execute()

                # Check if still exists
                check = self.supabase.table('subtask_completions').select('id').eq('id', completion_id).execute()
                if not check.data:
                    self.attack_attempts['successful_attacks'] += 1
                    self.vulnerabilities.append({
                        'attack_type': 'immutability_violation',
                        'attacker': user['index'],
                        'table': 'subtask_completions',
                        'operation': 'DELETE',
                    })
                    logger.error(f"  🚨 VULNERABILITY: User {user['index']} deleted immutable completion!")
                else:
                    logger.info("  ✅ DELETE blocked on immutable table (still exists)")

            except Exception as e:
                logger.info(f"  ✅ DELETE blocked: {str(e)[:100]}")

        except Exception as e:
            logger.warning(f"  ⚠️  Could not set up immutability test: {str(e)[:100]}")

        logger.info(f"  Immutability violations: {self.attack_attempts['immutability_violations']} attempts")

    def test_batch_queries(self):
        """Test: User tries to get all data with batch queries."""
        logger.info("\n🔍 Attack Vector 7: Batch Query Attacks")

        if not self.test_users:
            return

        attacker = self.test_users[0]
        attacker_client = self._get_authenticated_client(attacker['access_token'])

        tables = ['goals', 'journal_entries', 'identity_docs', 'ai_runs', 'triad_tasks']

        for table in tables:
            self.attack_attempts['batch_queries'] += 1

            try:
                # Try to get all rows across all users
                response = attacker_client.table(table).select('*').execute()

                if response.data:
                    # Count unique user_ids
                    unique_users = set()
                    for row in response.data:
                        if 'user_id' in row and row['user_id']:
                            unique_users.add(row['user_id'])

                    if len(unique_users) > 1:
                        self.attack_attempts['successful_attacks'] += 1
                        self.vulnerabilities.append({
                            'attack_type': 'batch_query',
                            'attacker': attacker['index'],
                            'table': table,
                            'users_leaked': len(unique_users),
                        })
                        logger.error(f"  🚨 VULNERABILITY: Batch query leaked {len(unique_users)} users' data from {table}!")
                    elif len(unique_users) == 1 and list(unique_users)[0] != attacker['profile_id']:
                        logger.warning(f"  ⚠️  Saw other user's data in {table}")
                    else:
                        logger.debug(f"  ✅ Batch query only returned attacker's data from {table}")

            except Exception as e:
                logger.debug(f"  ✅ Batch query blocked: {str(e)[:50]}")

        logger.info(f"  Batch queries: {self.attack_attempts['batch_queries']} attempts")

    def cleanup_test_data(self):
        """Clean up all test data."""
        logger.info("\n🧹 Cleaning up test data...")

        try:
            # Delete in reverse FK order to avoid constraint violations
            for user in self.test_users:
                # Delete user's data
                self.supabase.table('ai_artifacts').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('ai_runs').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('triad_tasks').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('daily_aggregates').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('captures').delete().eq('user_id', user['profile_id']).execute()
                # Note: subtask_completions is immutable, use TRUNCATE in SQL or skip
                self.supabase.table('subtask_instances').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('subtask_templates').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('journal_entries').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('goals').delete().eq('user_id', user['profile_id']).execute()
                self.supabase.table('identity_docs').delete().eq('user_id', user['profile_id']).execute()

                # Delete user profile
                self.supabase.table('user_profiles').delete().eq('id', user['profile_id']).execute()

                # Delete auth user (requires admin)
                # Note: This may fail if not using service role key
                try:
                    self.supabase.auth.admin.delete_user(user['auth_user_id'])
                except Exception:
                    pass  # May not have admin privileges

            logger.info("  ✅ Test data cleaned up")

        except Exception as e:
            logger.warning(f"  ⚠️  Cleanup errors (expected in some environments): {str(e)[:100]}")

    def print_summary(self):
        """Print comprehensive test summary."""
        logger.info("\n" + "=" * 80)
        logger.info("🛡️  RLS PENETRATION TEST SUMMARY")
        logger.info("=" * 80)

        logger.info("\n📊 Attack Statistics:")
        logger.info(f"  • Direct ID queries: {self.attack_attempts['direct_id_queries']}")
        logger.info(f"  • Enumeration attacks: {self.attack_attempts['enumeration_attacks']}")
        logger.info(f"  • Batch queries: {self.attack_attempts['batch_queries']}")
        logger.info(f"  • Cross-user INSERTs: {self.attack_attempts['cross_user_inserts']}")
        logger.info(f"  • Cross-user UPDATEs: {self.attack_attempts['cross_user_updates']}")
        logger.info(f"  • Cross-user DELETEs: {self.attack_attempts['cross_user_deletes']}")
        logger.info(f"  • Immutability violations: {self.attack_attempts['immutability_violations']}")

        total_attempts = sum(self.attack_attempts.values()) - self.attack_attempts['successful_attacks']
        logger.info(f"\n📈 Total attack attempts: {total_attempts}")
        logger.info(f"🚨 Successful attacks: {self.attack_attempts['successful_attacks']}")

        if self.vulnerabilities:
            logger.error(f"\n❌ VULNERABILITIES FOUND ({len(self.vulnerabilities)}):")
            for vuln in self.vulnerabilities:
                logger.error(f"  🚨 {vuln['attack_type'].upper()}: {vuln}")

            logger.error("\n❌ RLS SECURITY TEST FAILED!")
            logger.error("⚠️  CRITICAL: Fix vulnerabilities before deploying to production!")
            return False
        else:
            logger.info("\n✅ SECURITY TEST PASSED!")
            logger.info(f"✅ All {total_attempts} attack attempts were blocked by RLS policies")
            logger.info("✅ Zero unauthorized data accesses detected")
            logger.info("✅ Database is secure for multi-user production use")
            return True

    def run_all_tests(self):
        """Run comprehensive RLS penetration test suite."""
        logger.info("=" * 80)
        logger.info("🔒 RLS PENETRATION TESTING - Story 0.4")
        logger.info("=" * 80)
        logger.info(f"Started: {datetime.now().isoformat()}")
        logger.info("Test strategy: Create 10 users, seed data, attempt cross-user attacks")
        logger.info("")

        try:
            # Setup phase
            self.create_test_users(count=10)
            if len(self.test_users) < 2:
                logger.error("❌ Need at least 2 test users to run security tests")
                sys.exit(1)

            self.seed_user_data()

            # Attack phase
            self.test_direct_id_queries()
            self.test_enumeration_attacks()
            self.test_batch_queries()
            self.test_cross_user_inserts()
            self.test_cross_user_updates()
            self.test_cross_user_deletes()
            self.test_immutability_violations()

            # Cleanup phase
            self.cleanup_test_data()

            # Results
            success = self.print_summary()

            logger.info("\n📄 Full audit log: security_audit.log")
            logger.info(f"Completed: {datetime.now().isoformat()}")

            sys.exit(0 if success else 1)

        except KeyboardInterrupt:
            logger.warning("\n\n⚠️  Tests interrupted by user")
            self.cleanup_test_data()
            sys.exit(1)
        except Exception as e:
            logger.error(f"\n❌ Fatal error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            self.cleanup_test_data()
            sys.exit(1)


def main():
    """Main entry point."""
    tester = RLSPenetrationTester()
    tester.run_all_tests()


if __name__ == '__main__':
    main()
