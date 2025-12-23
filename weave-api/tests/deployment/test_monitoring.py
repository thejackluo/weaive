"""
Production monitoring tests.

Tests monitoring and observability configuration (Sentry, LogRocket).
"""

import pytest


@pytest.mark.deployment
class TestMonitoringConfiguration:
    """Tests for monitoring and observability tools."""

    def test_sentry_dsn_configured(self, railway_env_vars):
        """Verify SENTRY_DSN is set for error tracking."""
        sentry_dsn = railway_env_vars.get("SENTRY_DSN")

        assert sentry_dsn, "SENTRY_DSN not configured (required for error tracking)"

        # Sentry DSN format: https://<key>@<organization>.ingest.sentry.io/<project-id>
        assert sentry_dsn.startswith("https://"), (
            f"SENTRY_DSN should start with 'https://', got: {sentry_dsn[:10]}"
        )

        assert "sentry.io" in sentry_dsn, (
            f"SENTRY_DSN should contain 'sentry.io', got: {sentry_dsn}"
        )

    def test_logrocket_app_id_configured(self, railway_env_vars):
        """Verify LOGROCKET_APP_ID is set for session replay."""
        logrocket_app_id = railway_env_vars.get("LOGROCKET_APP_ID")

        assert logrocket_app_id, "LOGROCKET_APP_ID not configured (required for session replay)"

        # LogRocket App ID format: <organization>/<app-name>
        assert "/" in logrocket_app_id, (
            f"LOGROCKET_APP_ID should have format 'org/app', got: {logrocket_app_id}"
        )

        parts = logrocket_app_id.split("/")
        assert len(parts) == 2, (
            f"LOGROCKET_APP_ID should have 2 parts (org/app), got: {logrocket_app_id}"
        )

        assert parts[0] and parts[1], (
            f"LOGROCKET_APP_ID parts should not be empty, got: {logrocket_app_id}"
        )

    def test_environment_variable_set(self, railway_env_vars):
        """Verify ENVIRONMENT is set to 'production'."""
        environment = railway_env_vars.get("ENVIRONMENT") or railway_env_vars.get("ENV")

        assert environment, "ENVIRONMENT or ENV not configured"

        assert environment in ["production", "prod"], (
            f"ENVIRONMENT should be 'production' or 'prod', got: {environment}"
        )

    def test_debug_mode_disabled(self, railway_env_vars):
        """Verify DEBUG is set to 'false' in production."""
        debug = railway_env_vars.get("DEBUG", "false").lower()

        assert debug in ["false", "0", ""], f"DEBUG should be 'false' in production, got: {debug}"

    def test_log_level_appropriate(self, railway_env_vars):
        """Verify LOG_LEVEL is set appropriately for production."""
        log_level = railway_env_vars.get("LOG_LEVEL", "INFO").upper()

        # Production should use INFO, WARNING, or ERROR (not DEBUG)
        valid_levels = ["INFO", "WARNING", "ERROR", "CRITICAL"]

        assert log_level in valid_levels, (
            f"LOG_LEVEL should be one of {valid_levels} in production, got: {log_level}"
        )
