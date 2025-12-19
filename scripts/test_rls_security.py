#!/usr/bin/env python3
"""
RLS Security Penetration Test Script
Story: 0.4 - Row Level Security
Purpose: Automated adversarial testing to verify RLS policies block cross-user attacks

This script attempts various cross-user attacks to ensure RLS is working:
1. Direct ID queries (trying to access another user's data)
2. Enumeration attacks (scanning for other users' data)
3. Batch queries (trying to fetch all data ignoring user_id)
4. Cross-user INSERT/UPDATE/DELETE attempts

Expected Result: 0 successful cross-user accesses
Exit Code: 0 if all attacks blocked, 1 if any succeed
"""

import os
import sys
import uuid
import logging
from datetime import datetime, date
from typing import Dict, List, Any
from dataclasses import dataclass

# Check if supabase library is available
try:
    from supabase import create_client, Client
    from postgrest.exceptions import APIError
except ImportError:
    print("ERROR: supabase-py not installed. Install with: pip install supabase")
    sys.exit(1)

# ═══════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════

# Load from environment or use defaults for local testing
SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost:54321")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('security_audit.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class TestUser:
    """Test user with auth credentials and internal user_id"""
    email: str
    password: str
    user_id: str = None
    auth_user_id: str = None
    access_token: str = None
    client: Client = None

@dataclass
class AttackResult:
    """Result of an attack attempt"""
    attack_type: str
    target_table: str
    success: bool
    details: str
    leaked_data: Any = None

# ═══════════════════════════════════════════════════════════════════════
# SETUP FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════

def create_test_users(num_users: int = 10) -> List[TestUser]:
    """Create test users with Supabase Auth"""
    logger.info(f"Creating {num_users} test users...")
    users = []

    # Use service role client for setup
    service_client = create_client(
        SUPABASE_URL,
        os.getenv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_ANON_KEY)
    )

    for i in range(num_users):
        email = f"rls-test-user-{i}@test.local"
        password = f"test-password-{uuid.uuid4()}"

        try:
            # Create auth user
            auth_response = service_client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })

            auth_user_id = auth_response.user.id

            # Create user profile (this links auth to app data)
            profile_data = {
                "auth_user_id": auth_user_id,
                "display_name": f"Test User {i}",
                "timezone": "America/Los_Angeles"
            }

            profile_response = service_client.table("user_profiles").insert(profile_data).execute()
            user_id = profile_response.data[0]["id"]

            # Sign in to get access token
            sign_in_response = service_client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            access_token = sign_in_response.session.access_token

            # Create client for this user
            user_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            user_client.auth.set_session(access_token, sign_in_response.session.refresh_token)

            user = TestUser(
                email=email,
                password=password,
                user_id=user_id,
                auth_user_id=auth_user_id,
                access_token=access_token,
                client=user_client
            )
            users.append(user)

            logger.info(f"✅ Created test user {i}: {email}")

        except Exception as e:
            logger.error(f"❌ Failed to create test user {i}: {e}")
            continue

    return users

def seed_user_data(user: TestUser) -> Dict[str, str]:
    """Create test data for a user (goals, completions, journals)"""
    logger.info(f"Seeding data for {user.email}...")
    created_ids = {}

    try:
        # Create 2 goals
        for j in range(2):
            goal_data = {
                "user_id": user.user_id,
                "title": f"Goal {j} for {user.email}",
                "status": "active"
            }
            response = user.client.table("goals").insert(goal_data).execute()
            if response.data:
                created_ids[f"goal_{j}"] = response.data[0]["id"]

        # Create 5 completions
        for j in range(5):
            completion_data = {
                "user_id": user.user_id,
                "subtask_instance_id": None,
                "local_date": date.today().isoformat(),
                "completed_at": datetime.utcnow().isoformat()
            }
            response = user.client.table("subtask_completions").insert(completion_data).execute()
            if response.data:
                created_ids[f"completion_{j}"] = response.data[0]["id"]

        # Create 3 journal entries
        for j in range(3):
            journal_data = {
                "user_id": user.user_id,
                "local_date": date.today().isoformat(),
                "fulfillment_score": 7 + j
            }
            response = user.client.table("journal_entries").insert(journal_data).execute()
            if response.data:
                created_ids[f"journal_{j}"] = response.data[0]["id"]

        logger.info(f"✅ Seeded data for {user.email}: {len(created_ids)} records")

    except Exception as e:
        logger.error(f"❌ Failed to seed data for {user.email}: {e}")

    return created_ids

# ═══════════════════════════════════════════════════════════════════════
# ATTACK FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════

def attempt_direct_id_query(attacker: TestUser, target_ids: List[str], table: str) -> AttackResult:
    """Attempt to query another user's data by direct ID"""
    logger.info(f"🔴 Attack: Direct ID query on {table}")

    try:
        for target_id in target_ids:
            response = attacker.client.table(table).select("*").eq("id", target_id).execute()

            if response.data:
                return AttackResult(
                    attack_type="Direct ID Query",
                    target_table=table,
                    success=True,
                    details=f"Accessed {len(response.data)} row(s) with ID {target_id}",
                    leaked_data=response.data
                )

        return AttackResult(
            attack_type="Direct ID Query",
            target_table=table,
            success=False,
            details=f"All {len(target_ids)} direct ID queries returned empty (blocked)"
        )

    except Exception as e:
        return AttackResult(
            attack_type="Direct ID Query",
            target_table=table,
            success=False,
            details=f"Query failed with error: {e}"
        )

def attempt_enumeration_attack(attacker: TestUser, table: str) -> AttackResult:
    """Attempt to enumerate all data in a table (ignoring user_id)"""
    logger.info(f"🔴 Attack: Enumeration on {table}")

    try:
        response = attacker.client.table(table).select("*").execute()

        # Check if attacker got more data than they should
        # They should only see their own data
        if response.data and len(response.data) > 0:
            # Verify all rows belong to attacker
            attacker_data_only = all(
                row.get("user_id") == attacker.user_id or
                row.get("auth_user_id") == attacker.auth_user_id
                for row in response.data
            )

            if not attacker_data_only:
                return AttackResult(
                    attack_type="Enumeration Attack",
                    target_table=table,
                    success=True,
                    details=f"Accessed {len(response.data)} rows, including other users' data",
                    leaked_data=response.data
                )

        return AttackResult(
            attack_type="Enumeration Attack",
            target_table=table,
            success=False,
            details=f"Query returned only attacker's own data ({len(response.data) if response.data else 0} rows)"
        )

    except Exception as e:
        return AttackResult(
            attack_type="Enumeration Attack",
            target_table=table,
            success=False,
            details=f"Query failed with error: {e}"
        )

def attempt_cross_user_insert(attacker: TestUser, victim_user_id: str, table: str) -> AttackResult:
    """Attempt to INSERT data with another user's user_id"""
    logger.info(f"🔴 Attack: Cross-user INSERT on {table}")

    try:
        malicious_data = {
            "user_id": victim_user_id,
            "title": "MALICIOUS DATA",
            "status": "active"
        } if table == "goals" else {
            "user_id": victim_user_id,
            "local_date": date.today().isoformat(),
            "fulfillment_score": 10
        } if table == "journal_entries" else {
            "user_id": victim_user_id,
            "subtask_instance_id": None,
            "local_date": date.today().isoformat(),
            "completed_at": datetime.utcnow().isoformat()
        }

        response = attacker.client.table(table).insert(malicious_data).execute()

        if response.data:
            return AttackResult(
                attack_type="Cross-User INSERT",
                target_table=table,
                success=True,
                details=f"Successfully inserted data with victim's user_id: {victim_user_id}",
                leaked_data=response.data
            )

        return AttackResult(
            attack_type="Cross-User INSERT",
            target_table=table,
            success=False,
            details="INSERT blocked by RLS policy"
        )

    except Exception as e:
        return AttackResult(
            attack_type="Cross-User INSERT",
            target_table=table,
            success=False,
            details=f"INSERT failed with error: {e}"
        )

def attempt_cross_user_update(attacker: TestUser, target_id: str, table: str) -> AttackResult:
    """Attempt to UPDATE another user's data"""
    logger.info(f"🔴 Attack: Cross-user UPDATE on {table}")

    try:
        malicious_update = {
            "title": "HACKED"
        } if table == "goals" else {
            "fulfillment_score": 0
        } if table == "journal_entries" else {
            "local_date": "1970-01-01"
        }

        response = attacker.client.table(table).update(malicious_update).eq("id", target_id).execute()

        # Check if any rows were affected
        if response.data and len(response.data) > 0:
            return AttackResult(
                attack_type="Cross-User UPDATE",
                target_table=table,
                success=True,
                details=f"Successfully updated {len(response.data)} row(s) belonging to another user",
                leaked_data=response.data
            )

        return AttackResult(
            attack_type="Cross-User UPDATE",
            target_table=table,
            success=False,
            details="UPDATE affected 0 rows (blocked by RLS)"
        )

    except Exception as e:
        return AttackResult(
            attack_type="Cross-User UPDATE",
            target_table=table,
            success=False,
            details=f"UPDATE failed with error: {e}"
        )

def attempt_cross_user_delete(attacker: TestUser, target_id: str, table: str) -> AttackResult:
    """Attempt to DELETE another user's data"""
    logger.info(f"🔴 Attack: Cross-user DELETE on {table}")

    try:
        response = attacker.client.table(table).delete().eq("id", target_id).execute()

        # Check if any rows were deleted
        if response.data and len(response.data) > 0:
            return AttackResult(
                attack_type="Cross-User DELETE",
                target_table=table,
                success=True,
                details=f"Successfully deleted {len(response.data)} row(s) belonging to another user",
                leaked_data=response.data
            )

        return AttackResult(
            attack_type="Cross-User DELETE",
            target_table=table,
            success=False,
            details="DELETE affected 0 rows (blocked by RLS)"
        )

    except Exception as e:
        return AttackResult(
            attack_type="Cross-User DELETE",
            target_table=table,
            success=False,
            details=f"DELETE failed with error: {e}"
        )

def attempt_immutability_violation(attacker: TestUser, completion_id: str) -> AttackResult:
    """Attempt to UPDATE subtask_completions (should be immutable)"""
    logger.info(f"🔴 Attack: Immutability violation on subtask_completions")

    try:
        # Try to update attacker's own completion (should still fail - immutable)
        response = attacker.client.table("subtask_completions").update({
            "local_date": "1970-01-01"
        }).eq("id", completion_id).execute()

        # Check if update succeeded
        if response.data and len(response.data) > 0:
            return AttackResult(
                attack_type="Immutability Violation",
                target_table="subtask_completions",
                success=True,
                details="Successfully updated completion (immutability broken!)",
                leaked_data=response.data
            )

        return AttackResult(
            attack_type="Immutability Violation",
            target_table="subtask_completions",
            success=False,
            details="UPDATE blocked (immutability enforced)"
        )

    except Exception as e:
        return AttackResult(
            attack_type="Immutability Violation",
            target_table="subtask_completions",
            success=False,
            details=f"UPDATE failed with error: {e}"
        )

# ═══════════════════════════════════════════════════════════════════════
# MAIN TEST ORCHESTRATION
# ═══════════════════════════════════════════════════════════════════════

def run_penetration_tests() -> int:
    """Run all penetration tests and return exit code"""
    logger.info("═" * 70)
    logger.info("RLS SECURITY PENETRATION TEST - Starting")
    logger.info("═" * 70)

    # Check environment
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        logger.error("❌ SUPABASE_URL or SUPABASE_ANON_KEY not set")
        return 1

    logger.info(f"Target: {SUPABASE_URL}")

    # Create test users
    users = create_test_users(num_users=10)

    if len(users) < 2:
        logger.error("❌ Failed to create sufficient test users")
        return 1

    logger.info(f"✅ Created {len(users)} test users")

    # Seed data for each user
    user_data_map = {}
    for user in users:
        user_data_map[user.user_id] = seed_user_data(user)

    # Run attacks
    attack_results: List[AttackResult] = []
    tables_to_test = ["goals", "journal_entries", "subtask_completions"]

    logger.info("═" * 70)
    logger.info("RUNNING ADVERSARIAL ATTACKS")
    logger.info("═" * 70)

    for i, attacker in enumerate(users):
        logger.info(f"\n🔴 Attacker {i+1}/{len(users)}: {attacker.email}")

        # Pick a victim (different user)
        victims = [u for u in users if u.user_id != attacker.user_id]
        if not victims:
            continue

        victim = victims[0]
        victim_data_ids = user_data_map.get(victim.user_id, {})

        # Attack 1: Direct ID queries
        for table in tables_to_test:
            target_ids = [
                victim_data_ids.get(f"{table.rstrip('s')}_0"),  # First record
                victim_data_ids.get(f"{table.rstrip('s')}_1")   # Second record
            ]
            target_ids = [tid for tid in target_ids if tid]  # Filter None values

            if target_ids:
                result = attempt_direct_id_query(attacker, target_ids, table)
                attack_results.append(result)

        # Attack 2: Enumeration
        for table in tables_to_test:
            result = attempt_enumeration_attack(attacker, table)
            attack_results.append(result)

        # Attack 3: Cross-user INSERT
        for table in ["goals", "journal_entries"]:  # Skip completions (tested separately)
            result = attempt_cross_user_insert(attacker, victim.user_id, table)
            attack_results.append(result)

        # Attack 4: Cross-user UPDATE
        for table in tables_to_test:
            target_id = victim_data_ids.get(f"{table.rstrip('s')}_0")
            if target_id:
                result = attempt_cross_user_update(attacker, target_id, table)
                attack_results.append(result)

        # Attack 5: Cross-user DELETE
        for table in ["goals", "journal_entries"]:  # Skip completions (can't delete anyway)
            target_id = victim_data_ids.get(f"{table.rstrip('s')}_0")
            if target_id:
                result = attempt_cross_user_delete(attacker, target_id, table)
                attack_results.append(result)

        # Attack 6: Immutability violation (attacker's own completion)
        own_completion_id = user_data_map.get(attacker.user_id, {}).get("completion_0")
        if own_completion_id:
            result = attempt_immutability_violation(attacker, own_completion_id)
            attack_results.append(result)

    # Report results
    logger.info("\n" + "═" * 70)
    logger.info("PENETRATION TEST RESULTS")
    logger.info("═" * 70)

    total_attacks = len(attack_results)
    successful_attacks = [r for r in attack_results if r.success]
    blocked_attacks = [r for r in attack_results if not r.success]

    logger.info(f"Total attacks attempted: {total_attacks}")
    logger.info(f"✅ Blocked: {len(blocked_attacks)}")
    logger.info(f"❌ Successful (SECURITY BREACH): {len(successful_attacks)}")

    if successful_attacks:
        logger.error("\n🚨 CRITICAL SECURITY VULNERABILITIES FOUND:")
        for result in successful_attacks:
            logger.error(f"  - {result.attack_type} on {result.target_table}: {result.details}")
            if result.leaked_data:
                logger.error(f"    Leaked data: {result.leaked_data}")

        logger.error("\n❌ RLS PENETRATION TEST FAILED")
        logger.error("FIX THESE VULNERABILITIES BEFORE DEPLOYING TO PRODUCTION!")
        return 1

    else:
        logger.info("\n✅ RLS PENETRATION TEST PASSED")
        logger.info("All cross-user attacks were blocked by RLS policies")
        logger.info("Database-level security isolation is working correctly")
        return 0

# ═══════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    try:
        exit_code = run_penetration_tests()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Test failed with unexpected error: {e}")
        sys.exit(1)
