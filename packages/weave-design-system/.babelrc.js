module.exports = {
  presets: [
    '@react-native/babel-preset',
    '@babel/preset-flow',
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './src/tamagui.config.ts',
        logTimings: true,
        disableExtraction: process.env.NODE_ENV === 'development',
      },
    ],
  ],
};
