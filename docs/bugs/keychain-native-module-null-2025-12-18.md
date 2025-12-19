# Keychain Native Module Null Error

## Summary
`react-native-keychain` native module is `null`, causing Supabase auth initialization to fail.

## Error
```
ERROR [SECURE_STORAGE] Error getting item from keychain: 
[TypeError: Cannot read property 'getGenericPasswordForOptions' of null]
```

## Root Cause
The `react-native-keychain` native module is not properly linked/initialized. The JavaScript bridge cannot access the native iOS keychain implementation.

## Call Stack (Condensed)
1. `Keychain.getGenericPassword()` → `null.getGenericPasswordForOptions()` ❌
2. `secureStorage.getItem()` → `src/services/secureStorage.ts:35`
3. Supabase `_initialize()` → Session recovery attempts
4. App initialization → `app/(auth)/_layout.tsx`

## Impact
- Supabase auth cannot load persisted sessions
- Multiple retry attempts during app startup
- Auth flow may still work but session persistence fails

## Likely Causes
1. **Native module not linked** - Package installed but native code not linked
2. **App not rebuilt** - Need to rebuild after installing `react-native-keychain`
3. **iOS Pods not installed** - Run `cd ios && pod install`
4. **Development build issue** - Expo Go doesn't support native modules

## Files Affected
- `weave-mobile/src/services/secureStorage.ts:35` - Keychain access point
- `weave-mobile/lib/supabase.ts` - Supabase client initialization
- `weave-mobile/src/contexts/AuthContext.tsx` - Auth context setup

## Solution Steps
1. Verify `react-native-keychain` is in `package.json`
2. Rebuild native app (not just Metro restart)
3. For iOS: `cd weave-mobile/ios && pod install && cd ..`
4. For Expo: May need development build (not Expo Go)
5. Check if native module is properly linked in build config

