-- Create goal-memories storage bucket
-- Migration: Create storage bucket for goal memories (photos)

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'goal-memories',
    'goal-memories',
    true, -- Public bucket (images are publicly accessible)
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] -- Allowed image types
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies for goal-memories bucket

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

-- Allow authenticated users to read all images (public bucket)
CREATE POLICY "Anyone can view images"
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

-- 3. Create goal_memories table to track image metadata
CREATE TABLE IF NOT EXISTS goal_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT fk_goal_memories_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_memories_user FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_goal_memories_goal_id ON goal_memories(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_memories_user_id ON goal_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_memories_created_at ON goal_memories(created_at DESC);

-- 4. Enable RLS on goal_memories table
ALTER TABLE goal_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_memories table

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

-- Add comment for documentation
COMMENT ON TABLE goal_memories IS 'Stores metadata for goal memory photos (images associated with goals)';
COMMENT ON COLUMN goal_memories.image_url IS 'Public URL to the image in Supabase Storage';
COMMENT ON COLUMN goal_memories.storage_path IS 'Storage path in format: {goal_id}/{filename}';
