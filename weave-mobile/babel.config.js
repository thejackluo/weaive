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
      'react-native-reanimated/plugin', // Must be last plugin
    ],
  };
};
