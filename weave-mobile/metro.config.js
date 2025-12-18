const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Add extraNodeModules for path aliases
// SIMPLIFIED: design-system is now at weave-mobile/src/design-system
config.resolver.extraNodeModules = {
  '@': path.resolve(projectRoot, 'src'),
  app: path.resolve(projectRoot, 'app'),
};

module.exports = withNativeWind(config, { input: './global.css' });
