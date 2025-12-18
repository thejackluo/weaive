const path = require('path');

module.exports = function (api) {
  api.cache(true);

  const projectRoot = __dirname;

  return {
    presets: [
      // CRITICAL: jsxImportSource tells Babel to use NativeWind's JSX runtime
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // NativeWind v4: Must be in PRESETS array (not plugins)
      'nativewind/babel',
    ],
    plugins: [
      // Module resolver for path aliases
      // SIMPLIFIED: design-system is now at weave-mobile/src/design-system
      // So @/design-system works automatically via the @ alias
      [
        'module-resolver',
        {
          root: [projectRoot],
          alias: {
            '@': path.resolve(projectRoot, 'src'),
            app: path.resolve(projectRoot, 'app'),
          },
        },
      ],
    ],
  };
};
