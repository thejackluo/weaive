const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

// Try to load Sentry config with Windows-compatible path handling
// Falls back to default config if Windows ESM path issues occur
let config;

// Check if we're on Windows to handle path issues
const isWindows = process.platform === 'win32';

try {
  // Dynamically require to catch errors during module loading
  let getSentryExpoConfig;
  try {
    getSentryExpoConfig = require("@sentry/react-native/metro").getSentryExpoConfig;
  } catch (requireError) {
    // If require fails, use default config
    throw requireError;
  }

  // Use normalized path for Windows compatibility
  const projectRoot = isWindows 
    ? path.resolve(__dirname).replace(/\\/g, '/')  // Convert backslashes to forward slashes
    : path.resolve(__dirname);
  
  config = getSentryExpoConfig(projectRoot);
} catch (error) {
  // Fallback to default config if Sentry config fails
  if (error.code === 'ERR_UNSUPPORTED_ESM_URL_SCHEME' || error.message?.includes('ESM')) {
    console.warn('⚠️  Sentry Metro config skipped due to Windows ESM path issue.');
    console.warn('   Sentry will still work via Expo plugin, but source maps may be less accurate.');
    console.warn('   Error:', error.message);
  }
  config = getDefaultConfig(__dirname);
}

module.exports = withNativewind(config, { input: './global.css' });