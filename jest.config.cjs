/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  watchman: false,
  transform: {
    '^.+\\.[cm]?js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'json'],
  testMatch: ['**/__tests__/**/*.test.js'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  clearMocks: true
};
