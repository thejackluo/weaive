-- ============================================================================
-- REMOTE SUPABASE SETUP: Goal Memories
-- Run this in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql/new
-- ============================================================================

-- 1. Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'goal-memories',
    'goal-memories',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create goal_memories table
CREATE TABLE IF NOT EXISTS goal_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_goal_memories_goal_id ON goal_memories(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_memories_user_id ON goal_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_memories_created_at ON goal_memories(created_at DESC);

-- 4. Enable RLS
ALTER TABLE goal_memories ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (prevents duplicate errors)
DROP POLICY IF EXISTS "users_select_own_memories" ON goal_memories;
DROP POLICY IF EXISTS "users_insert_own_memories" ON goal_memories;
DROP POLICY IF EXISTS "users_delete_own_memories" ON goal_memories;

-- 6. Create RLS policies for goal_memories table
CREATE POLICY "users_select_own_memories" ON goal_memories
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

CREATE POLICY "users_insert_own_memories" ON goal_memories
    FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
        ) AND
        goal_id IN (
            SELECT id FROM goals WHERE user_id IN (
                SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "users_delete_own_memories" ON goal_memories
    FOR DELETE
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- 7. Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload images to their own goals" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view goal memory images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own goal images" ON storage.objects;

-- 8. Create storage policies
CREATE POLICY "Users can upload images to their own goals"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'goal-memories' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM goals WHERE user_id IN (
            SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
        )
    )
);

CREATE POLICY "Anyone can view goal memory images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'goal-memories');

CREATE POLICY "Users can delete their own goal images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'goal-memories' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM goals WHERE user_id IN (
            SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
        )
    )
);

-- ✅ Done! You can now test image uploads in the app.
