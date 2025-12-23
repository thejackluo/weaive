"""
Factory for creating complete test users with full data for GDPR export testing.

This factory creates users with ALL types of data to validate data export completeness:
- User profile
- Goals (3 active goals)
- Subtask templates and instances (3 per goal = 9 total)
- Subtask completions (10 completions)
- Journal entries (5 entries)
- Identity document (Thread)
- AI chat history (3 messages)
- Proof photo captures (3 photos in Supabase Storage)
- Daily aggregates
- Triad tasks

Used by: tests/test_gdpr_compliance_api.py (Story 9.4 - GDPR Compliance)
"""

import base64
import uuid
from datetime import date, datetime, timedelta, timezone

from faker import Faker
from supabase import Client

fake = Faker()


def create_complete_test_user(supabase: Client) -> dict:
    """
    Create a test user with COMPLETE data across all 12 user-owned tables.

    This factory is specifically designed for GDPR data export testing.
    It creates a realistic user with goals, completions, journal entries,
    proof photos, and AI chat history.

    Args:
        supabase: Supabase client with admin/service role privileges

    Returns:
        dict with:
            - user_id: UUID of user_profiles.id
            - auth_user_id: UUID of auth.users (for JWT generation)
            - email: User email (for JWT generation)
            - goals: List of goal IDs
            - completions: List of completion IDs
            - journal_entries: List of journal entry IDs
            - proof_photos: List of storage paths

    Example:
        user = create_complete_test_user(supabase)
        print(user["user_id"])  # User profile ID
        print(len(user["goals"]))  # 3 goals
        print(len(user["completions"]))  # 10 completions
    """
    email = fake.email()
    auth_user_id = str(uuid.uuid4())

    # 1. Create user profile
    user_data = {
        "auth_user_id": auth_user_id,
        "email": email,  # Add email to user_profiles (if column exists)
        "timezone": "America/Los_Angeles",
        "onboarding_completed": True,  # User has completed onboarding
        "created_at": fake.date_time_between(start_date="-30d", end_date="now", tzinfo=timezone.utc).isoformat(),
    }

    user_result = supabase.table("user_profiles").insert(user_data).execute()
    user_id = user_result.data[0]["id"]

    # 2. Create identity document (Thread)
    identity_doc = {
        "user_id": user_id,
        "from_text": fake.paragraph(nb_sentences=2),
        "to_text": fake.paragraph(nb_sentences=2),
        "identity_traits": fake.random_sample(
            elements=["Disciplined", "Creative", "Confident", "Focused", "Resilient"],
            length=3,
        ),
        "created_at": fake.date_time_between(start_date="-30d", end_date="-25d", tzinfo=timezone.utc).isoformat(),
    }
    supabase.table("identity_docs").insert(identity_doc).execute()

    # 3. Create 3 active goals
    goal_ids = []
    subtask_template_ids = []

    for i in range(3):
        goal_data = {
            "user_id": user_id,
            "title": fake.sentence(nb_words=4).rstrip("."),
            "status": "active",
            "created_at": fake.date_time_between(start_date="-25d", end_date="-20d", tzinfo=timezone.utc).isoformat(),
        }
        goal_result = supabase.table("goals").insert(goal_data).execute()
        goal_id = goal_result.data[0]["id"]
        goal_ids.append(goal_id)

        # 4. Create 3 subtask templates per goal (9 total)
        for j in range(3):
            subtask_template_data = {
                "goal_id": goal_id,
                "user_id": user_id,
                "title": fake.sentence(nb_words=5).rstrip("."),
                "recurrence_pattern": "daily",
                "created_at": fake.date_time_between(start_date="-20d", end_date="-15d", tzinfo=timezone.utc).isoformat(),
            }
            template_result = supabase.table("subtask_templates").insert(subtask_template_data).execute()
            subtask_template_ids.append(template_result.data[0]["id"])

    # 5. Create subtask instances from templates (bind instances for recent dates)
    subtask_instance_ids = []
    for template_id in subtask_template_ids[:5]:  # Create instances for first 5 templates
        for day_offset in range(2):  # 2 days of instances
            instance_data = {
                "template_id": template_id,
                "user_id": user_id,
                "local_date": (date.today() - timedelta(days=day_offset)).isoformat(),
                "status": "active",
                "created_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
            }
            instance_result = supabase.table("subtask_instances").insert(instance_data).execute()
            subtask_instance_ids.append(instance_result.data[0]["id"])

    # 6. Create 10 subtask completions
    completion_ids = []
    for i in range(10):
        instance_id = fake.random_element(subtask_instance_ids)
        completion_data = {
            "instance_id": instance_id,
            "user_id": user_id,
            "completed_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
            "timer_seconds": fake.random_int(min=300, max=3600),  # 5-60 minutes
            "notes": fake.sentence() if fake.boolean(chance_of_getting_true=70) else None,
        }
        completion_result = supabase.table("subtask_completions").insert(completion_data).execute()
        completion_ids.append(completion_result.data[0]["id"])

    # 7. Create 3 proof photo captures in Supabase Storage
    storage_paths = []
    for i in range(3):
        # Generate minimal valid JPEG (1x1 red pixel)
        # This is a real JPEG file that can be uploaded to storage
        jpeg_base64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaQqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooA//Z"

        # Upload to Supabase Storage
        jpeg_bytes = base64.b64decode(jpeg_base64)
        storage_path = f"test_user_{user_id}/proof_photo_{i}.jpg"

        try:
            supabase.storage.from_("captures").upload(
                path=storage_path,
                file=jpeg_bytes,
                file_options={"content-type": "image/jpeg"}
            )
            storage_paths.append(storage_path)

            # Create capture record
            capture_data = {
                "completion_id": fake.random_element(completion_ids),
                "user_id": user_id,
                "type": "photo",
                "storage_path": storage_path,
                "created_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
            }
            supabase.table("captures").insert(capture_data).execute()
        except Exception:
            # Ignore storage errors (bucket might not exist in test env)
            pass

    # 8. Create 5 journal entries
    journal_entry_ids = []
    for i in range(5):
        entry_date = date.today() - timedelta(days=i)
        journal_data = {
            "user_id": user_id,
            "local_date": entry_date.isoformat(),
            "fulfillment_score": fake.random_int(min=1, max=10),
            "default_responses": {
                "today_reflection": fake.paragraph(nb_sentences=2),
                "tomorrow_focus": fake.sentence(),
            },
            "custom_responses": {},
            "created_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
        }
        journal_result = supabase.table("journal_entries").insert(journal_data).execute()
        journal_entry_ids.append(journal_result.data[0]["id"])

    # 9. Create 3 AI chat messages (Dream Self conversations)
    for i in range(3):
        ai_run_data = {
            "user_id": user_id,
            "operation_type": "chat_response",
            "ai_provider": fake.random_element(["openai", "anthropic"]),
            "model": fake.random_element(["gpt-4o-mini", "claude-3-7-sonnet"]),
            "total_cost": fake.pydecimal(left_digits=2, right_digits=4, positive=True),
            "created_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
        }
        ai_run_result = supabase.table("ai_runs").insert(ai_run_data).execute()
        ai_run_id = ai_run_result.data[0]["id"]

        # Create AI artifact (chat message)
        ai_artifact_data = {
            "ai_run_id": ai_run_id,
            "user_id": user_id,
            "artifact_type": "chat_message",
            "content_text": fake.paragraph(nb_sentences=3),
            "created_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
        }
        supabase.table("ai_artifacts").insert(ai_artifact_data).execute()

    # 10. Create daily aggregates (stats for recent days)
    for day_offset in range(7):
        aggregate_date = date.today() - timedelta(days=day_offset)
        aggregate_data = {
            "user_id": user_id,
            "local_date": aggregate_date.isoformat(),
            "binds_completed": fake.random_int(min=1, max=5),
            "fulfillment_score": fake.random_int(min=1, max=10),
            "total_ai_calls": fake.random_int(min=1, max=10),
            "created_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
        }
        supabase.table("daily_aggregates").insert(aggregate_data).execute()

    # 11. Create triad tasks (AI-generated daily plan)
    for day_offset in range(3):
        task_date = date.today() - timedelta(days=day_offset)
        triad_data = {
            "user_id": user_id,
            "local_date": task_date.isoformat(),
            "task_text": fake.sentence(nb_words=8),
            "completed": fake.boolean(chance_of_getting_true=60),
            "created_at": fake.date_time_between(start_date="-10d", end_date="now", tzinfo=timezone.utc).isoformat(),
        }
        supabase.table("triad_tasks").insert(triad_data).execute()

    return {
        "user_id": user_id,
        "auth_user_id": auth_user_id,
        "email": email,
        "goals": goal_ids,
        "completions": completion_ids,
        "journal_entries": journal_entry_ids,
        "proof_photos": storage_paths,
    }
