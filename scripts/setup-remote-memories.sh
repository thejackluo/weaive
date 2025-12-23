#!/bin/bash
# Setup goal-memories bucket and table on remote Supabase

echo "Setting up goal-memories on remote Supabase..."
echo ""

# 1. Create storage bucket via API
echo "1. Creating storage bucket..."
curl -X POST 'https://jywfusrgwybljusuofnp.supabase.co/storage/v1/bucket' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5d2Z1c3Jnd3libGp1c3VvZm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDcyMzE1MCwiZXhwIjoyMDUwMjk5MTUwfQ.TkyLIINyDRklETxyI5tKIg_q78AqcoD" \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "goal-memories",
    "name": "goal-memories",
    "public": true,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  }'

echo ""
echo ""
echo "2. Now run the SQL to create table and policies:"
echo "   Visit: https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql/new"
echo "   Copy/paste the SQL from: scripts/create-goal-memories-table.sql"
echo ""
