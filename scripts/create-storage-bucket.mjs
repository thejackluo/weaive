#!/usr/bin/env node
/**
 * Create goal-memories storage bucket in Supabase
 * Run with: node scripts/create-storage-bucket.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Local Supabase connection
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // Local service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('Creating goal-memories storage bucket...');

  try {
    // Create bucket
    const { data, error } = await supabase.storage.createBucket('goal-memories', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists!');
        return;
      }
      throw error;
    }

    console.log('✅ Bucket created successfully!', data);
  } catch (error) {
    console.error('❌ Error creating bucket:', error);
    process.exit(1);
  }
}

createBucket();
