/**
 * Mock for @react-native/js-polyfills
 *
 * This mock resolves Jest/Babel issues with Flow-typed syntax in React Native's
 * internal polyfill files. The actual polyfills aren't needed for unit tests
 * since we're testing in Node.js environment, not React Native runtime.
 */

module.exports = {};
