-- Migration 002: identity_docs
-- Purpose: Store versioned identity documents (archetype, dream self, motivations, constraints)
-- Story: 0.2a - Database Schema (Core Tables)
-- Pattern: Append-only versioning - each edit creates new version

CREATE TABLE identity_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
  json JSONB NOT NULL,  -- Stores: archetype, dream_self, motivations, failure_mode, constraints
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, version)
);

-- Indexes
CREATE INDEX idx_identity_docs_user_version ON identity_docs(user_id, version DESC);

-- Comments for documentation
COMMENT ON TABLE identity_docs IS 'Versioned identity documents. Each user edit creates new version. AI uses latest version for personalization.';
COMMENT ON COLUMN identity_docs.json IS 'JSONB structure: {archetype, dream_self, motivations[], failure_mode, constraints, coaching_preference}';
COMMENT ON COLUMN identity_docs.version IS 'Auto-incremented version number. Query with ORDER BY version DESC LIMIT 1 for latest.';
