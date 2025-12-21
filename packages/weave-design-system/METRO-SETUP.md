# Metro Bundler Setup for Tamagui

This design system package includes Tamagui for UI primitives. To use this package in your React Native app, you need to configure Metro bundler in your **consuming app's root directory**.

## Required Metro Configuration

Edit your app's `metro.config.js`:

```javascript
const path = require('path');

module.exports = {
  watchFolders: [
    path.resolve(__dirname, 'packages'), // Watch design system package
    path.resolve(__dirname, 'node_modules/@tamagui'), // Watch Tamagui packages
    path.resolve(__dirname, '.tamagui'), // Watch Tamagui cache
  ],
  resolver: {
    // Add path alias for design system
    extraNodeModules: {
      '@weave/design-system': path.resolve(__dirname, 'packages/weave-design-system/src'),
    },
    // Tamagui-specific extensions
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: ['glb', 'gltf', 'png', 'jpg'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

## TypeScript Path Mapping

Edit your app's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@weave/design-system": ["./packages/weave-design-system/src"]
    }
  }
}
```

## Why These Changes Are Needed

1. **`watchFolders`**: Metro needs to watch the design system package directory for changes during development. Without this, changes to design system files won't trigger rebuilds.

2. **`.tamagui` folder**: Tamagui generates optimized styles at build time and caches them in `.tamagui/`. Metro must watch this directory.

3. **`extraNodeModules`**: Enables importing the design system using the scoped package name `@weave/design-system` instead of relative paths.

4. **Path aliases in TypeScript**: Provides IDE autocomplete and type checking for imports from `@weave/design-system`.

## Verification

After updating Metro config:

1. Clear Metro cache: `npx expo start --clear` or `npx react-native start --reset-cache`
2. Restart your development server
3. Verify import works:
   ```tsx
   import { ThemeProvider, useTheme } from '@weave/design-system';
   ```

## Troubleshooting

### "Unable to resolve module @weave/design-system"

- Ensure `watchFolders` includes the package directory
- Ensure `extraNodeModules` maps to the correct path
- Clear Metro cache and restart

### "Tamagui styles not applying"

- Ensure `.tamagui` is in `watchFolders`
- Check that Babel plugin is configured (in package's `.babelrc.js`)
- Verify `@tamagui/babel-plugin` is installed

### "Metro bundler crashes on Tamagui files"

- Check that `sourceExts` includes `.mjs` and `.cjs`
- Ensure React Native is v0.72+ (Tamagui requires modern RN)

## Production Builds

For production:

1. Tamagui's Babel plugin automatically extracts styles at compile time
2. No runtime style computation = better performance
3. Bundle size is optimized through tree-shaking

## More Information

- Tamagui Metro docs: https://tamagui.dev/docs/guides/metro
- React Native Metro docs: https://reactnative.dev/docs/metro
