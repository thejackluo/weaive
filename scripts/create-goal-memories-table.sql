-- Create goal_memories table and RLS policies
-- Run this in Supabase Studio SQL Editor: http://127.0.0.1:54323

-- 1. Create goal_memories table
CREATE TABLE IF NOT EXISTS goal_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_goal_memories_goal_id ON goal_memories(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_memories_user_id ON goal_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_memories_created_at ON goal_memories(created_at DESC);

-- 3. Enable RLS
ALTER TABLE goal_memories ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Users can view their own goal memories
CREATE POLICY "users_select_own_memories" ON goal_memories
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Users can insert memories for their own goals
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

-- Users can delete their own memories
CREATE POLICY "users_delete_own_memories" ON goal_memories
    FOR DELETE
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- 5. Storage RLS Policies

-- Allow authenticated users to upload images to their own goal folders
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

-- Allow authenticated users to read all images
CREATE POLICY "Anyone can view goal memory images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'goal-memories');

-- Allow users to delete their own goal images
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

-- Done! Test by trying to upload an image through the app.
