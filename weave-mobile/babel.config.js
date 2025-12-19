module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel", // NativeWind v5 Babel preset
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
