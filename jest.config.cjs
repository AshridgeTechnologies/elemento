/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    testEnvironment:        'node',
    verbose:                true,
    roots:                  ['build'],
    testMatch:              ["**/tests/**/*.test.js"],
    testPathIgnorePatterns: ["<rootDir>/build/tests/functional"],
    snapshotResolver:       './tests/snapshotResolver.cjs'
};