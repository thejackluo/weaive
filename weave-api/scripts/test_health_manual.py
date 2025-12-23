#!/usr/bin/env python3
"""
Manual health check validation script.
Tests the enhanced health endpoint without pytest dependencies.

Usage:
    uv run python scripts/test_health_manual.py
"""

import os
import signal
import subprocess
import sys
import time

import requests


def start_server():
    """Start uvicorn server in background."""
    print("🚀 Starting uvicorn server...")
    proc = subprocess.Popen(
        ["uv", "run", "uvicorn", "app.main:app", "--port", "8001"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    time.sleep(5)  # Wait for startup
    return proc


def stop_server(proc):
    """Stop uvicorn server."""
    print("🛑 Stopping server...")
    proc.send_signal(signal.SIGTERM)
    proc.wait(timeout=5)


def test_health_check_success():
    """Test health check with valid database connection."""
    print("\n✅ Test 1: Health check with database connection")

    response = requests.get("http://localhost:8001/health")

    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {response.json()}")

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "healthy", f"Expected 'healthy', got {data['status']}"
    assert data["database"] == "connected", f"Expected 'connected', got {data.get('database')}"
    assert "timestamp" in data, "Missing timestamp"

    print("   ✅ PASSED: Health check returns healthy with database connection")


def test_health_check_failure():
    """Test health check with invalid database connection."""
    print("\n❌ Test 2: Health check with database failure")
    print("   (Temporarily setting invalid SUPABASE_URL)")

    # Save original env
    original_url = os.getenv("SUPABASE_URL")

    # Set invalid URL and restart server
    os.environ["SUPABASE_URL"] = "https://invalid.supabase.co"

    proc = start_server()

    try:
        response = requests.get("http://localhost:8001/health")

        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")

        assert response.status_code == 503, f"Expected 503, got {response.status_code}"
        data = response.json()
        assert data["status"] == "unhealthy", f"Expected 'unhealthy', got {data['status']}"
        assert "error" in data, "Missing error message"
        assert "database" in data["error"].lower(), "Error should mention database"

        print("   ✅ PASSED: Health check returns unhealthy with database failure")
    finally:
        stop_server(proc)
        # Restore original env
        if original_url:
            os.environ["SUPABASE_URL"] = original_url
        else:
            os.environ.pop("SUPABASE_URL", None)


def main():
    """Run all manual health check tests."""
    print("=" * 60)
    print("Manual Health Check Validation")
    print("=" * 60)

    # Test 1: Valid database connection
    proc = start_server()
    try:
        test_health_check_success()
    except Exception as e:
        print(f"\n❌ Test 1 FAILED: {e}")
        stop_server(proc)
        sys.exit(1)
    finally:
        stop_server(proc)

    # Test 2: Invalid database connection
    try:
        test_health_check_failure()
    except Exception as e:
        print(f"\n❌ Test 2 FAILED: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED")
    print("=" * 60)


if __name__ == "__main__":
    main()
