# Voice/STT Database Migrations (Story 0.11)

Quick reference for applying database migrations for voice recording and speech-to-text features.

## Quick Apply (Recommended)

**Option 1: Supabase Dashboard SQL Editor** (Fastest)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Copy contents of `supabase/migrations/APPLY_VOICE_MIGRATIONS.sql`
4. Run the query
5. Verify: Go to Storage → should see "captures" bucket

**Option 2: Supabase CLI** (For production)

```bash
# Install CLI (if needed)
npm install -g supabase

# Link project
cd weavelight-design-system
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## What Gets Applied

### Migration 1: Audio Storage Enhancement
- ✅ `captures.duration_sec` column (INT, nullable)
- ✅ `captures` storage bucket (25MB, private)
- ✅ 4 RLS policies for folder-based isolation (`{user_id}/*`)

### Migration 2: STT Rate Limiting
- ✅ `daily_aggregates.stt_request_count` (50/day limit)
- ✅ `daily_aggregates.stt_duration_minutes` (300 min/day)
- ✅ `ai_runs.audio_duration_sec` (for cost tracking)
- ✅ `ai_runs.confidence_score` (STT quality 0.0-1.0)

## Verification

After applying migrations:

```sql
-- Check everything created
SELECT
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'captures') as bucket_exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%captures%') as policy_count,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'daily_aggregates'
   AND column_name IN ('stt_request_count', 'stt_duration_minutes')) as stt_columns;

-- Should return: bucket_exists=1, policy_count=4, stt_columns=2
```

Or check visually:
- Storage → "captures" bucket should exist
- Database → Tables → `daily_aggregates` → should have `stt_request_count` and `stt_duration_minutes` columns

## Migration Files

All migration files are in `supabase/migrations/`:

| File | Purpose |
|------|---------|
| `20251221000002_audio_storage_enhancement.sql` | Full migration with comments |
| `20251221000003_stt_rate_limiting.sql` | Full migration with comments |
| `APPLY_VOICE_MIGRATIONS.sql` | **Combined migrations, clean SQL (use this!)** |

## Troubleshooting

### "Already exists" warnings
✅ **Good!** Migrations are idempotent. Safe to re-run.

### Permission denied
❌ Using anon key instead of service role key.
**Solution:** Verify you're logged in to Supabase Dashboard or using service role key.

### Python scripts not working
The Python migration scripts (`scripts/apply_*.py`) were created but have limitations with Supabase's API permissions. **Use SQL Editor instead** - it's faster and more reliable.

## Automated Scripts (Optional)

If you prefer programmatic application:

```bash
# Direct PostgreSQL connection (requires DB password)
cd weavelight-design-system
uv run --directory weave-api python ../scripts/apply_migrations_direct.py
```

**Note:** Requires `SUPABASE_DB_PASSWORD` in `weave-api/.env`
**Get password:** Supabase Dashboard → Settings → Database → Connection string

See `scripts/README-MIGRATIONS.md` for detailed script documentation.
