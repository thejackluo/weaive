const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

// Use default Expo config - Sentry is configured via Expo plugin in app.json
// This avoids Windows ESM path resolution issues with getSentryExpoConfig
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, { input: './global.css' });