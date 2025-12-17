const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NativeWind v4 is configured via babel.config.js (nativewind/babel plugin)
// No additional metro configuration needed

module.exports = config;
