module.exports = function (api) {
  api.cache(true);

  // Detect test environment (Jest)
  const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

  return {
    presets: [
      "babel-preset-expo",
      // NativeWind v5 Babel preset - disable in test environment
      // Jest doesn't support NativeWind's CSS transformations
      ...(!isTest ? ["nativewind/babel"] : []),
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            app: './app',
          },
        },
      ],
      // 'react-native-reanimated/plugin', // TEMPORARILY DISABLED: React 19 + Reanimated ref bug
      // See GitHub issue for details: Causes crash with "You attempted to set the key `current` with the value `undefined`"
    ],
  };
};
