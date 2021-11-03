/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment:        'node',
    verbose:                true,
    roots:                  ['tests'],
    testMatch:              ["**/*.test.ts", "**/*.test.tsx"],
    testPathIgnorePatterns: ["<rootDir>/tests/functional"],
};