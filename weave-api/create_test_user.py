#!/usr/bin/env python3
"""
Create a test user in local Supabase for development
"""

import requests

# Local Supabase credentials
SUPABASE_URL = "http://127.0.0.1:54321"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"


def create_test_user():
    """Create test user via Supabase auth API"""

    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {"apikey": ANON_KEY, "Content-Type": "application/json"}
    data = {
        "email": "test@example.com",
        "password": "password123",
        "data": {"display_name": "Test User"},
    }

    print("📝 Creating test user...")
    response = requests.post(url, headers=headers, json=data)

    if response.status_code in [200, 201]:
        result = response.json()
        user_id = result.get("user", {}).get("id") or result.get("id")
        print("✅ Test user created!")
        print("   Email: test@example.com")
        print("   Password: password123")
        print(f"   User ID: {user_id}")
        return user_id
    else:
        print(f"❌ Failed to create user: {response.status_code}")
        print(f"   Response: {response.text}")
        return None


if __name__ == "__main__":
    create_test_user()
