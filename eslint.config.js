// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // React Compiler is not enabled. These compiler-oriented rules reject
      // established React Native Animated and API-loading patterns.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // Apostrophes inside React Native <Text> are plain text, not HTML.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
