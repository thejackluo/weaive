module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NativeWind support for Tailwind CSS in React Native
      'nativewind/babel',
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
