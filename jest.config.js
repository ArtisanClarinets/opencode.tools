module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^../../tools/(.*)$': '<rootDir>/tools/$1',
    '^../../../tools/(.*)$': '<rootDir>/tools/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    'agents/**/*.ts',
    'tools/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};