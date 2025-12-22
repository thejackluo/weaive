/**
 * Debug helper to inspect current authentication state.
 * Use this to troubleshoot 404 errors in identity bootup.
 */

import { decode as base64Decode } from 'base-64';

import { supabase } from '@lib/supabase';
import { getApiBaseUrl } from '../utils/api';

/**
 * Debug current auth session and JWT token.
 * Call this before trying identity bootup to see your auth state.
 *
 * @example
 * ```ts
 * import { debugAuthState } from '@/services/debug-auth';
 *
 * // In your component
 * const handleDebug = async () => {
 *   await debugAuthState();
 * };
 * ```
 */
export async function debugAuthState() {
  console.log('🔍 ===== AUTH DEBUG START =====');

  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
      return;
    }

    if (!session) {
      console.error('❌ No session found - user is NOT logged in');
      console.log('💡 User needs to sign up or log in first');
      return;
    }

    console.log('✅ Session exists');
    console.log('📝 Session details:');
    console.log('   User ID (auth.uid()):', session.user.id);
    console.log('   Email:', session.user.email);
    console.log('   Access Token (first 50 chars):', session.access_token.substring(0, 50) + '...');
    console.log('   Access Token (full length):', session.access_token.length, 'characters');

    // Decode JWT to see the payload (without verification)
    try {
      const base64Url = session.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        base64Decode(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      console.log('📦 JWT Payload:');
      console.log('   sub (auth_user_id):', payload.sub);
      console.log('   email:', payload.email);
      console.log('   role:', payload.role);
      console.log('   exp:', new Date(payload.exp * 1000).toISOString());

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.error('⚠️  JWT TOKEN IS EXPIRED!');
        console.log('💡 User needs to refresh their session or log in again');
      } else {
        console.log('✅ JWT token is still valid');
        const minutesLeft = Math.floor((payload.exp - now) / 60);
        console.log(`   Expires in ${minutesLeft} minutes`);
      }

      console.log('\n📋 COPY THIS FOR BACKEND VERIFICATION:');
      console.log(`   auth_user_id: ${payload.sub}`);
      console.log(`   Full JWT token: ${session.access_token}`);

      console.log('\n💡 To check if this user has a profile in the backend:');
      console.log('   1. Copy the auth_user_id above');
      console.log('   2. In backend terminal, run:');
      console.log(
        '      PYTHONPATH=/Users/eddielou/weavelight/weave-api uv run python scripts/check_user_token.py <JWT_TOKEN>'
      );
    } catch (decodeError) {
      console.error('❌ Failed to decode JWT:', decodeError);
    }
  } catch (error) {
    console.error('❌ Unexpected error in debugAuthState:', error);
  }

  console.log('🔍 ===== AUTH DEBUG END =====');
}

/**
 * Call the debug endpoint to see current user's profile status.
 * This makes a request to the backend to check if user_profile exists.
 */
export async function debugUserProfile() {
  console.log('🔍 ===== USER PROFILE DEBUG START =====');

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ No session - cannot check profile');
      return;
    }

    const API_BASE_URL = getApiBaseUrl();

    const response = await fetch(`${API_BASE_URL}/api/onboarding/debug/current-user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Debug endpoint response:', data);
      console.log('   JWT auth_user_id:', data.auth_user_id);
      console.log('   Profile exists:', data.profile_exists);

      if (data.profile_exists) {
        console.log('✅ User profile EXISTS in database');
        console.log('   Profile ID:', data.profile_data.id);
        console.log('   Preferred name:', data.profile_data.preferred_name || 'None');
      } else {
        console.error('❌ User profile DOES NOT EXIST in database');
        console.log('💡 This is why you are getting 404 errors!');
        console.log('💡 Solution: Create user_profile with SQL:');
        console.log(`   INSERT INTO user_profiles (auth_user_id, timezone, locale)`);
        console.log(`   VALUES ('${data.auth_user_id}', 'America/Los_Angeles', 'en-US');`);
      }
    } else {
      console.error('❌ Debug endpoint failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('   Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Failed to call debug endpoint:', error);
  }

  console.log('🔍 ===== USER PROFILE DEBUG END =====');
}
