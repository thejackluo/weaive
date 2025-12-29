"""
Test script for daily bind instance generation

This script tests that:
1. Daily binds are generated for new days
2. No duplicates are created
3. Binds appear correctly after generation
"""

import asyncio
import os
from datetime import date

# Set up path for imports
import sys
sys.path.insert(0, '/Users/eddielou/weavelight-tree2/weave-api')

from supabase import create_client
from app.api.binds.router import generate_missing_bind_instances

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wvkldbmhwpgkvgjdxvmn.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_ROLE_KEY not set")
    sys.exit(1)


async def test_bind_generation():
    """Test daily bind generation"""

    # Create Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("🧪 Testing Daily Bind Instance Generation")
    print("=" * 60)

    # Use a test user (replace with actual user_id from your database)
    # For now, let's fetch the first user
    try:
        user_response = supabase.table("user_profiles").select("id").limit(1).execute()
        if not user_response.data:
            print("❌ No users found in database")
            return

        user_id = user_response.data[0]["id"]
        print(f"✅ Using user_id: {user_id}")
    except Exception as e:
        print(f"❌ Error fetching user: {e}")
        return

    # Get today's date
    today = date.today().isoformat()
    print(f"📅 Today's date: {today}")

    # Count active bind templates
    try:
        templates_response = (
            supabase.table("subtask_templates")
            .select("id, title, recurrence_rule", count="exact")
            .eq("user_id", user_id)
            .eq("is_archived", False)
            .execute()
        )

        print(f"\n📋 Active bind templates: {templates_response.count}")
        for template in templates_response.data:
            print(f"   - {template['title']} ({template['recurrence_rule']})")
    except Exception as e:
        print(f"❌ Error fetching templates: {e}")
        return

    # Count existing instances for today
    try:
        instances_before = (
            supabase.table("subtask_instances")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("scheduled_for_date", today)
            .execute()
        )

        print(f"\n📊 Instances BEFORE generation: {instances_before.count}")
    except Exception as e:
        print(f"❌ Error counting instances: {e}")
        return

    # Run bind generation
    print(f"\n🔄 Running generate_missing_bind_instances...")
    try:
        created_count = await generate_missing_bind_instances(supabase, user_id, today)
        print(f"✅ Created {created_count} new instances")
    except Exception as e:
        print(f"❌ Error generating instances: {e}")
        import traceback
        traceback.print_exc()
        return

    # Count instances after generation
    try:
        instances_after = (
            supabase.table("subtask_instances")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("scheduled_for_date", today)
            .execute()
        )

        print(f"\n📊 Instances AFTER generation: {instances_after.count}")
    except Exception as e:
        print(f"❌ Error counting instances after: {e}")
        return

    # Test duplicate prevention - run generation again
    print(f"\n🔄 Running generation AGAIN (should create 0 duplicates)...")
    try:
        created_count_2 = await generate_missing_bind_instances(supabase, user_id, today)
        print(f"✅ Created {created_count_2} instances on second run")

        if created_count_2 == 0:
            print("✅ PASS: No duplicates created")
        else:
            print("❌ FAIL: Duplicates were created!")
    except Exception as e:
        print(f"❌ Error in duplicate test: {e}")
        return

    # Final count
    try:
        instances_final = (
            supabase.table("subtask_instances")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("scheduled_for_date", today)
            .execute()
        )

        print(f"\n📊 Final instance count: {instances_final.count}")
    except Exception as e:
        print(f"❌ Error counting final instances: {e}")
        return

    print("\n" + "=" * 60)
    print("✅ Test completed!")


if __name__ == "__main__":
    asyncio.run(test_bind_generation())
