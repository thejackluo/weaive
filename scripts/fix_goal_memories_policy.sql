-- Fix goal-memories storage policy to allow anonymous (public) access
-- React Native Image component doesn't send auth headers, so we need anon access

-- Drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- Create new policy allowing anonymous (public) access to view images
CREATE POLICY "Public can view goal memory images"
ON storage.objects
FOR SELECT
TO anon, authenticated  -- Allow both anonymous and authenticated users
USING (bucket_id = 'goal-memories');

-- Verify the policy was created
SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname = 'Public can view goal memory images';
