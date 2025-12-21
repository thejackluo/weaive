const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure for monorepo - watch design system package
config.watchFolders = [
  path.resolve(__dirname, '../packages/weave-design-system'),
];

// Configure node_modules resolution for monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../packages/weave-design-system/node_modules'),
];

module.exports = withNativewind(config, { input: './global.css' });