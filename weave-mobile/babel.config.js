module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Module resolver for path aliases (@/*, app/*)
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/design-system': '../src/design-system',
            app: './app',
          },
        },
      ],
    ],
  };
};
