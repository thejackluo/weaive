module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      // NativeWind v4 preset (must be in presets, not plugins!)
      'nativewind/babel',
    ],
    plugins: [
      // Module resolver for path aliases (@/*, app/*)
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
    ],
  };
};
