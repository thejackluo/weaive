#!/bin/bash
# Quick JWT test to see exact backend error

cd /Users/eddielou/weavelight-tree2/weave-api

# Get JWT token
TOKEN=$(uv run python -c "
from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))
auth = sb.auth.sign_in_with_password({'email': 'test@weave.local', 'password': 'testpassword123'})
print(auth.session.access_token)
")

echo "Testing API with JWT token..."
curl -v -H "Authorization: Bearer $TOKEN" http://localhost:8004/api/binds/today 2>&1 | tail -20
