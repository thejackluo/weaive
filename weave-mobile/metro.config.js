const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

// Skip Sentry Metro config on Windows due to path resolution issues
// Sentry still works via Expo plugin (@sentry/react-native/expo in app.json)
const isWindows = process.platform === 'win32';

let config;

if (isWindows) {
  // On Windows, skip Sentry Metro config to avoid path corruption issues
  // Sentry will still work via the Expo plugin for error tracking
  config = getDefaultConfig(__dirname);
} else {
  // On Unix systems, try to use Sentry Metro config for better source maps
  try {
    const { getSentryExpoConfig } = require("@sentry/react-native/metro");
    const projectRoot = path.resolve(__dirname);
    config = getSentryExpoConfig(projectRoot);
  } catch (error) {
    // Fallback to default config if Sentry config fails
    console.warn('⚠️  Sentry Metro config skipped.');
    console.warn('   Sentry will still work via Expo plugin, but source maps may be less accurate.');
    console.warn('   Error:', error.message || error.code);
    config = getDefaultConfig(__dirname);
  }
}

module.exports = withNativewind(config, { input: './global.css' });