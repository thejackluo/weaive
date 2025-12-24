"""Tests for GDPR compliance API endpoints (Story 9.4).

This test suite follows ATDD (Acceptance Test-Driven Development) principles.
All tests are initially FAILING (RED phase) and will guide implementation.

Story: 9.4 - App Store Readiness - GDPR Compliance
Coverage: AC #2.1 (Data Export), AC #2.2 (Account Deletion)

Test Strategy:
- All tests use real Supabase database (integration tests)
- Test data created with factories using faker
- Auto-cleanup after each test via conftest.py
- Given-When-Then structure for clarity
"""

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestDataExportEndpoint:
    """Test suite for GET /api/user/export-data endpoint.

    These tests validate GDPR right to data portability (AC #2.1).
    User must be able to export ALL their data in machine-readable format.
    """

    def test_data_export_returns_complete_user_data(
        self, client, create_auth_token, supabase_client, complete_test_user
    ):
        """GIVEN: User with complete data (goals, completions, journal, photos)
        WHEN: GET /api/user/export-data is called
        THEN: Returns JSON with ALL user data

        Validates: AC #2.1 (Data Export - Complete Data)
        """
        # GIVEN: User with complete data
        user = complete_test_user(supabase_client)
        token = create_auth_token(user_id=user["auth_user_id"])

        # WHEN: Exporting user data
        response = client.get("/api/user/export-data", headers={"Authorization": f"Bearer {token}"})

        # THEN: Data export successful
        assert response.status_code == 200, (
            f"Expected 200, got {response.status_code}: {response.text}"
        )
        data = response.json()

        # Validate response structure
        assert "data" in data, "Response missing 'data' field"
        assert "meta" in data, "Response missing 'meta' field"

        export_data = data["data"]

        # Validate user profile present
        assert "user" in export_data, "Export missing 'user' field"
        assert export_data["user"]["email"] == user["email"]
        assert export_data["user"]["created_at"] is not None

        # Validate goals present (user has 3 goals from factory)
        assert "goals" in export_data, "Export missing 'goals' field"
        assert len(export_data["goals"]) == 3, f"Expected 3 goals, got {len(export_data['goals'])}"
        assert export_data["goals"][0]["title"] is not None

        # Validate subtasks present (user has 9 subtasks: 3 per goal)
        assert "subtasks" in export_data, "Export missing 'subtasks' field"
        assert len(export_data["subtasks"]) >= 9, (
            f"Expected at least 9 subtasks, got {len(export_data['subtasks'])}"
        )

        # Validate completions present (user has 10 completions from factory)
        assert "completions" in export_data, "Export missing 'completions' field"
        assert len(export_data["completions"]) == 10, (
            f"Expected 10 completions, got {len(export_data['completions'])}"
        )
        assert export_data["completions"][0]["completed_at"] is not None

        # Validate journal entries present (user has 5 entries from factory)
        assert "journal_entries" in export_data, "Export missing 'journal_entries' field"
        assert len(export_data["journal_entries"]) == 5, (
            f"Expected 5 journal entries, got {len(export_data['journal_entries'])}"
        )
        assert export_data["journal_entries"][0]["fulfillment_score"] is not None

        # Validate identity document present
        assert "identity_document" in export_data, "Export missing 'identity_document' field"
        assert export_data["identity_document"]["from_text"] is not None

        # Validate AI chat history present (user has 3 chat messages from factory)
        assert "ai_chat_history" in export_data, "Export missing 'ai_chat_history' field"
        assert len(export_data["ai_chat_history"]) == 3, (
            f"Expected 3 chat messages, got {len(export_data['ai_chat_history'])}"
        )

        # Validate proof photos present (user has 3 photos from factory)
        assert "proof_photos" in export_data, "Export missing 'proof_photos' field"
        assert len(export_data["proof_photos"]) == 3, (
            f"Expected 3 proof photos, got {len(export_data['proof_photos'])}"
        )

    def test_data_export_includes_signed_storage_urls(
        self, client, create_auth_token, supabase_client, complete_test_user
    ):
        """GIVEN: User with proof photo captures in Supabase Storage
        WHEN: GET /api/user/export-data is called
        THEN: Proof photos include signed Supabase Storage URLs (1-hour expiry)

        Validates: AC #2.1 (Data Export - Signed URLs)
        """
        # GIVEN: User with proof photos
        user = complete_test_user(supabase_client)
        token = create_auth_token(user_id=user["auth_user_id"])

        # WHEN: Exporting user data
        response = client.get("/api/user/export-data", headers={"Authorization": f"Bearer {token}"})

        # THEN: Proof photos include signed URLs
        assert response.status_code == 200
        export_data = response.json()["data"]

        proof_photos = export_data["proof_photos"]
        assert len(proof_photos) > 0, "No proof photos in export"

        # Validate first proof photo has signed URL
        first_photo = proof_photos[0]
        assert first_photo.startswith("https://"), f"Invalid URL format: {first_photo}"
        assert "supabase.co" in first_photo or "localhost" in first_photo, (
            "Not a Supabase Storage URL"
        )
        assert "sign" in first_photo or "token" in first_photo, (
            "URL is not signed (missing signature)"
        )

    def test_data_export_requires_authentication(self, client):
        """GIVEN: Unauthenticated request
        WHEN: GET /api/user/export-data is called without JWT token
        THEN: Returns 401 Unauthorized

        Validates: AC #2.1 (Data Export - Authentication Required)
        """
        # GIVEN: No authentication token
        # WHEN: Attempting data export without auth
        response = client.get("/api/user/export-data")

        # THEN: Request rejected with 401
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        error = response.json()
        assert "error" in error, "Error response missing 'error' field"


class TestAccountDeletionEndpoint:
    """Test suite for DELETE /api/user/account endpoint.

    These tests validate GDPR right to erasure (AC #2.2).
    User must be able to delete their account with 30-day recovery period.
    """

    def test_account_deletion_soft_deletes_user(
        self, client, create_auth_token, supabase_client, complete_test_user
    ):
        """GIVEN: Authenticated user
        WHEN: DELETE /api/user/account is called
        THEN: User soft-deleted (deleted_at timestamp set)

        Validates: AC #2.2 (Account Deletion - Soft Delete)
        """
        # GIVEN: Authenticated user
        user = complete_test_user(supabase_client)
        token = create_auth_token(user_id=user["auth_user_id"])

        # WHEN: Deleting account
        response = client.delete("/api/user/account", headers={"Authorization": f"Bearer {token}"})

        # THEN: Account soft-deleted
        assert response.status_code == 200, (
            f"Expected 200, got {response.status_code}: {response.text}"
        )
        data = response.json()

        # Validate response message
        assert "data" in data
        assert "message" in data["data"]
        assert "30 days" in data["data"]["message"], (
            "Response should mention 30-day recovery period"
        )

        # Verify user_profiles.deleted_at is set
        user_profile = (
            supabase_client.table("user_profiles").select("*").eq("id", user["user_id"]).execute()
        )
        assert len(user_profile.data) > 0, "User profile not found after soft delete"
        assert user_profile.data[0]["deleted_at"] is not None, "deleted_at timestamp not set"

        # Verify deleted_at is recent (within last 10 seconds)
        deleted_at = datetime.fromisoformat(
            user_profile.data[0]["deleted_at"].replace("Z", "+00:00")
        )
        now = datetime.now(timezone.utc)
        assert (now - deleted_at).total_seconds() < 10, "deleted_at timestamp too old"

    def test_account_deletion_logs_out_user_immediately(
        self, client, create_auth_token, supabase_client, complete_test_user
    ):
        """GIVEN: Authenticated user
        WHEN: DELETE /api/user/account is called
        THEN: User logged out immediately (JWT invalidated)

        Validates: AC #2.2 (Account Deletion - Immediate Logout)
        """
        # GIVEN: Authenticated user
        user = complete_test_user(supabase_client)
        token = create_auth_token(user_id=user["auth_user_id"])

        # WHEN: Deleting account
        response = client.delete("/api/user/account", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200

        # THEN: Token no longer valid (subsequent requests fail)
        # Try to export data with same token
        export_response = client.get(
            "/api/user/export-data", headers={"Authorization": f"Bearer {token}"}
        )

        # Should return 401 or 403 (user deleted or token invalidated)
        assert export_response.status_code in [401, 403], (
            f"Expected 401/403 for deleted user, got {export_response.status_code}"
        )

    def test_account_recovery_within_30_days(
        self, client, create_auth_token, supabase_client, complete_test_user
    ):
        """GIVEN: User soft-deleted less than 30 days ago
        WHEN: User attempts to login
        THEN: Account recovered (deleted_at set to NULL)

        Validates: AC #2.2 (Account Deletion - 30-Day Recovery)
        """
        # GIVEN: User soft-deleted 5 days ago
        user = complete_test_user(supabase_client)

        # Manually soft-delete user 5 days ago
        five_days_ago = datetime.now(timezone.utc) - timedelta(days=5)
        supabase_client.table("user_profiles").update({"deleted_at": five_days_ago.isoformat()}).eq(
            "id", user["user_id"]
        ).execute()

        # WHEN: User attempts login (simulated via POST /api/auth/login)
        # NOTE: This endpoint doesn't exist yet - will need to implement
        # For now, we'll test the recovery logic directly via GET /api/user/profile
        token = create_auth_token(user_id=user["auth_user_id"])
        _response = client.get("/api/user/profile", headers={"Authorization": f"Bearer {token}"})

        # THEN: Account should be recovered
        # If recovery implemented, deleted_at should be NULL
        user_profile = (
            supabase_client.table("user_profiles")
            .select("deleted_at")
            .eq("id", user["user_id"])
            .execute()
        )

        # EXPECTED BEHAVIOR: deleted_at is NULL after recovery
        # This test will FAIL until recovery logic implemented
        assert user_profile.data[0]["deleted_at"] is None, (
            "Account should be recovered (deleted_at = NULL) when user logs in within 30 days"
        )

    def test_account_hard_delete_after_30_days(self, client, supabase_client, complete_test_user):
        """GIVEN: User soft-deleted more than 30 days ago
        WHEN: Hard delete job runs (cron or manual trigger)
        THEN: User permanently deleted from database (cascade across 12 tables)

        Validates: AC #2.2 (Account Deletion - Hard Delete After 30 Days)
        """
        # GIVEN: User soft-deleted 31 days ago
        user = complete_test_user(supabase_client)

        # Manually soft-delete user 31 days ago
        thirty_one_days_ago = datetime.now(timezone.utc) - timedelta(days=31)
        supabase_client.table("user_profiles").update(
            {"deleted_at": thirty_one_days_ago.isoformat()}
        ).eq("id", user["user_id"]).execute()

        # WHEN: Hard delete job runs
        # For testing, we'll manually trigger hard delete
        # DELETE FROM user_profiles WHERE deleted_at < NOW() - INTERVAL '30 days'
        supabase_client.table("user_profiles").delete().eq("id", user["user_id"]).execute()

        # THEN: User completely removed from database
        user_profile = (
            supabase_client.table("user_profiles").select("*").eq("id", user["user_id"]).execute()
        )
        assert len(user_profile.data) == 0, "User profile should be permanently deleted"

        # Verify cascade delete worked (child records also deleted)
        goals = supabase_client.table("goals").select("*").eq("user_id", user["user_id"]).execute()
        assert len(goals.data) == 0, "Goals should be cascade deleted"

        completions = (
            supabase_client.table("subtask_completions")
            .select("*")
            .eq("user_id", user["user_id"])
            .execute()
        )
        assert len(completions.data) == 0, "Completions should be cascade deleted"

        journal_entries = (
            supabase_client.table("journal_entries")
            .select("*")
            .eq("user_id", user["user_id"])
            .execute()
        )
        assert len(journal_entries.data) == 0, "Journal entries should be cascade deleted"

    def test_account_deletion_cascades_across_all_tables(
        self, client, supabase_client, complete_test_user
    ):
        """GIVEN: User with data in all 12 user-owned tables
        WHEN: Hard delete executed
        THEN: Data removed from ALL 12 tables (cascade delete)

        Validates: AC #2.2 (Account Deletion - Cascade Delete)
        """
        # GIVEN: User with complete data
        user = complete_test_user(supabase_client)
        user_id = user["user_id"]

        # Verify user has data in all tables BEFORE delete
        tables_to_verify = [
            "user_profiles",
            "identity_docs",
            "goals",
            "subtask_templates",
            "subtask_instances",
            "subtask_completions",
            "captures",
            "journal_entries",
            "daily_aggregates",
            "triad_tasks",
            "ai_runs",
            "ai_artifacts",
        ]

        records_before = {}
        for table in tables_to_verify:
            result = (
                supabase_client.table(table)
                .select("count", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            records_before[table] = result.count
            if table == "user_profiles":
                assert records_before[table] >= 1, f"User should exist in {table}"
            # Note: Some tables might be 0 if complete_test_user factory doesn't create them yet

        # WHEN: Hard delete user
        supabase_client.table("user_profiles").delete().eq("id", user_id).execute()

        # THEN: ALL child records deleted across all 12 tables
        for table in tables_to_verify:
            result = (
                supabase_client.table(table)
                .select("count", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            assert result.count == 0, (
                f"Table {table} should have 0 records after cascade delete, but has {result.count}"
            )


# Pytest marker for integration tests
pytestmark = pytest.mark.integration
