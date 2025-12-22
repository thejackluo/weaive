# Story 9.2: Production Database Setup

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 5 story points
**Status:** Ready for Development

---

## User Story

**As a** developer
**I want to** configure Supabase production instance with migrations and backups
**So that** user data is stored securely and can be recovered in case of failure

---

## Acceptance Criteria

### Supabase Production Instance
- [ ] Create new Supabase production project (separate from dev/staging)
- [ ] Upgrade to Supabase Pro Plan ($25/month)
  - Provides production SLA (99.9% uptime)
  - Includes daily automatic backups
  - Better performance and support

### Database Migration
- [ ] Run all migrations from `supabase/migrations/` directory in order
- [ ] Use command: `npx supabase db push --db-url $DATABASE_URL`
- [ ] Verify all 12+ tables created successfully:
  - `user_profiles`, `identity_docs`, `goals`, `subtask_templates`
  - `subtask_instances`, `subtask_completions`, `captures`, `journal_entries`
  - `daily_aggregates`, `triad_tasks`, `ai_runs`, `ai_artifacts`

### Row Level Security Verification
- [ ] Verify RLS enabled on all 12 user-owned tables
- [ ] Run query: `SELECT * FROM pg_policies;`
- [ ] Test RLS with multiple test users (no cross-user data access)
- [ ] Document RLS policies in production environment

### Backup Configuration
- [ ] Enable daily automatic backups (included in Pro Plan)
- [ ] Set backup retention to 7 days
- [ ] Test manual backup creation via Supabase dashboard
- [ ] Document backup restoration procedure

### Connection Pooling
- [ ] Enable PgBouncer (Supabase's connection pooler)
- [ ] Configure connection pool settings:
  - Max connections: 20 (sufficient for MVP)
  - Transaction mode (recommended for FastAPI)
- [ ] Update `DATABASE_URL` to use pooled connection string

### Testing
- [ ] Test database connection from Railway production backend
- [ ] Run sample queries to verify data persistence
- [ ] Test authentication flow (JWT token validation)
- [ ] Verify Supabase Storage accessible (image/audio uploads)

### Documentation
- [ ] Document migration rollback procedure:
  - How to revert migrations
  - How to restore from backup
  - Emergency contact for Supabase support
- [ ] Document production database credentials (securely)

---

## Technical Notes

### Migration Command
```bash
# Set production database URL
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres"

# Push all migrations
npx supabase db push --db-url $DATABASE_URL

# Verify migration success
npx supabase db diff --linked
```

### RLS Verification Query
```sql
-- Check all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should return 30+ policies (3-5 per user-owned table)
```

### Connection Pooling Setup
```python
# weave-api/app/core/database.py
# Use pooled connection string from Supabase
DATABASE_URL = os.getenv("DATABASE_URL")  # Already points to pooler

# Connection pool managed by PgBouncer (no changes needed)
```

### Backup Restoration (Emergency Procedure)
1. Go to Supabase Dashboard → Project Settings → Backups
2. Select backup to restore (shows date/time)
3. Click "Restore" (creates new database from backup)
4. Update `DATABASE_URL` to point to restored database
5. Verify data integrity

---

## Dependencies

**Requires:**
- Epic 0 complete (database schema defined)
- Supabase migrations written and tested in dev/staging

**Unblocks:**
- Story 9.1 (Production Backend Deployment - needs DATABASE_URL)
- Story 9.5 (Production Security Hardening - audits RLS)

---

## Definition of Done

- [ ] Supabase production project created and upgraded to Pro
- [ ] All migrations applied successfully
- [ ] RLS policies active on all user-owned tables
- [ ] Automatic backups enabled
- [ ] Connection pooling configured
- [ ] Production database tested from backend
- [ ] Backup restoration procedure documented
- [ ] Code reviewed and approved

---

## Testing Checklist

- [ ] All tables exist in production database
- [ ] RLS policies prevent cross-user data access
- [ ] Database connection works from Railway backend
- [ ] Sample data can be inserted and retrieved
- [ ] Supabase Storage works (test image upload)
- [ ] Backup can be created and restored

---

## Resources

- **Supabase Pro Plan:** https://supabase.com/pricing
- **Supabase Migrations:** https://supabase.com/docs/guides/cli/local-development#database-migrations
- **PgBouncer Setup:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---
