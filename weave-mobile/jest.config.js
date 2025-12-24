module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|expo-.*|@unimodules|@supabase|@tanstack|react-native-sse)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/design-system$': '<rootDir>/src/design-system/index.ts',
    '^@/design-system/(.*)$': '<rootDir>/src/design-system/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.(ts|tsx|js)',
    '<rootDir>/app/**/__tests__/**/*.test.(ts|tsx|js)',
    '<rootDir>/src/**/*.test.(ts|tsx|js)',
    '<rootDir>/app/**/*.test.(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/archive/',
    '/__archive__/',
    '/docs/',
    '/dev/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  testEnvironment: 'node',
};
