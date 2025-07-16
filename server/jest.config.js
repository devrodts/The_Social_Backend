module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  // Exclude E2E tests from unit test runs
  testPathIgnorePatterns: ['/node_modules/', '.*\\.e2e-spec\\.ts$'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
}; 