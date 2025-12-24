-- ============================================================================
-- Database Table Template for Weave Backend
-- Story 1.5.2: Backend API/Model Standardization
-- ============================================================================
--
-- This template provides standardized patterns for creating new database tables.
-- Replace {table}, {resources} placeholders with your resource name.
--
-- Example:
-- - {table} = goals
-- - {TABLE} = GOALS (for constraints)
-- - {resource} = goal
--
-- Usage:
-- 1. Copy this template to supabase/migrations/YYYYMMDDHHMMSS_{table}.sql
-- 2. Replace all {placeholders} with your resource name
-- 3. Add resource-specific columns in the RESOURCE-SPECIFIC COLUMNS section
-- 4. Update constraints and indexes as needed
-- 5. Run: npx supabase db push
-- ============================================================================

-- ============================================================================
-- TABLE DEFINITION
-- ============================================================================

CREATE TABLE {table} (
    -- PRIMARY KEY
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- FOREIGN KEYS
    -- Every user-owned table should reference user_profiles
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- Add other foreign keys as needed:
    -- goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    -- parent_id UUID REFERENCES {table}(id) ON DELETE SET NULL,

    -- ========================================================================
    -- RESOURCE-SPECIFIC COLUMNS (CUSTOMIZE THIS SECTION)
    -- ========================================================================

    -- Example: Text fields
    title TEXT NOT NULL,
    description TEXT,

    -- Example: Status/enum fields
    status TEXT NOT NULL DEFAULT 'active',

    -- Example: Boolean flags
    is_archived BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Example: Numeric fields
    sort_order INTEGER DEFAULT 0,
    progress_percentage NUMERIC(5,2) DEFAULT 0.0,

    -- Example: Date fields
    scheduled_for_date DATE,
    completed_at TIMESTAMPTZ,

    -- Example: JSON fields (use sparingly)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- ========================================================================
    -- STANDARD TIMESTAMP COLUMNS (REQUIRED FOR ALL TABLES)
    -- ========================================================================

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Soft delete timestamp (NULL = active, NOT NULL = deleted)
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- ========================================================================
    -- CONSTRAINTS
    -- ========================================================================

    -- Status enum constraint (customize valid values)
    CONSTRAINT {table}_status_check CHECK (
        status IN ('active', 'completed', 'archived', 'abandoned')
    ),

    -- Percentage constraint (0-100)
    CONSTRAINT {table}_progress_check CHECK (
        progress_percentage >= 0 AND progress_percentage <= 100
    ),

    -- Date constraint (scheduled date cannot be in the past)
    -- CONSTRAINT {table}_scheduled_date_check CHECK (
    --     scheduled_for_date >= CURRENT_DATE
    -- ),

    -- Unique constraint example (if needed)
    -- CONSTRAINT {table}_unique_user_title UNIQUE (user_id, title)
);


-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for user queries (most common)
-- Only include active (non-deleted) records
CREATE INDEX idx_{table}_user_id ON {table}(user_id)
    WHERE deleted_at IS NULL;

-- Index for soft delete filtering
CREATE INDEX idx_{table}_deleted_at ON {table}(deleted_at)
    WHERE deleted_at IS NULL;

-- Index for status queries
CREATE INDEX idx_{table}_status ON {table}(status)
    WHERE deleted_at IS NULL;

-- Composite index for common query patterns
-- Example: Get active records for a user on a specific date
-- CREATE INDEX idx_{table}_user_date ON {table}(user_id, scheduled_for_date)
--     WHERE deleted_at IS NULL;

-- Full-text search index (if needed)
-- CREATE INDEX idx_{table}_search ON {table}
--     USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));


-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

-- This trigger automatically updates the updated_at column on every UPDATE
CREATE TRIGGER update_{table}_updated_at
    BEFORE UPDATE ON {table}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: The update_updated_at_column() function should already exist
-- If not, create it once (not per-table):
--
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = now();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Story 0.4
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own resources
CREATE POLICY "users_manage_own_{table}" ON {table}
    FOR ALL
    USING (
        user_id IN (
            SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
        )
    );

-- Alternative: Separate policies for different operations
-- (Use this if you need different rules for SELECT/INSERT/UPDATE/DELETE)

-- DROP POLICY IF EXISTS "users_manage_own_{table}" ON {table};

-- CREATE POLICY "users_select_own_{table}" ON {table}
--     FOR SELECT
--     USING (
--         user_id IN (
--             SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
--         )
--     );

-- CREATE POLICY "users_insert_own_{table}" ON {table}
--     FOR INSERT
--     WITH CHECK (
--         user_id IN (
--             SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
--         )
--     );

-- CREATE POLICY "users_update_own_{table}" ON {table}
--     FOR UPDATE
--     USING (
--         user_id IN (
--             SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
--         )
--     );

-- CREATE POLICY "users_delete_own_{table}" ON {table}
--     FOR DELETE
--     USING (
--         user_id IN (
--             SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
--         )
--     );


-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE {table} IS 'User {resources} - [Brief description of what this table stores]';
COMMENT ON COLUMN {table}.id IS 'Primary key (UUID)';
COMMENT ON COLUMN {table}.user_id IS 'Owner user ID (references user_profiles)';
COMMENT ON COLUMN {table}.title IS 'Resource title';
COMMENT ON COLUMN {table}.status IS 'Current status: active, completed, archived, abandoned';
COMMENT ON COLUMN {table}.deleted_at IS 'Soft delete timestamp (NULL = active)';


-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Get all active records for a user
-- SELECT * FROM {table}
-- WHERE user_id = '...'
--   AND deleted_at IS NULL;

-- Get archived records
-- SELECT * FROM {table}
-- WHERE user_id = '...'
--   AND is_archived = TRUE
--   AND deleted_at IS NULL;

-- Soft delete a record
-- UPDATE {table}
-- SET deleted_at = now()
-- WHERE id = '...' AND user_id = '...';

-- Restore soft deleted record
-- UPDATE {table}
-- SET deleted_at = NULL
-- WHERE id = '...' AND user_id = '...';

-- Get records created in last 7 days
-- SELECT * FROM {table}
-- WHERE user_id = '...'
--   AND created_at >= now() - INTERVAL '7 days'
--   AND deleted_at IS NULL;

-- Count records by status
-- SELECT status, COUNT(*) as count
-- FROM {table}
-- WHERE user_id = '...'
--   AND deleted_at IS NULL
-- GROUP BY status;


-- ============================================================================
-- NAMING CONVENTIONS REFERENCE
-- ============================================================================

/*
Tables: snake_case, plural
- user_profiles, journal_entries, subtask_completions

Columns: snake_case
- user_id, local_date, scheduled_for_date, is_archived

Foreign Keys: {table}_id
- user_id, goal_id, parent_id

Indexes: idx_{table}_{columns}
- idx_goals_user_id, idx_completions_user_date

Constraints: {table}_{column}_check
- goals_status_check, completions_score_check

Triggers: {action}_{table}_{column}
- update_goals_updated_at
*/


-- ============================================================================
-- MIGRATION NAMING CONVENTION
-- ============================================================================

/*
Supabase migrations should be named:
YYYYMMDDHHMMSS_descriptive_name.sql

Example:
20251223120000_create_goals_table.sql
20251223120100_add_goals_progress_column.sql
20251223120200_create_subtask_templates_table.sql

Run migrations:
npx supabase db push

Check migration status:
npx supabase migration list
*/
