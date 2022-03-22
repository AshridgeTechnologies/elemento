/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment:        'node',
    verbose:                true,
    roots:                  ['tests'],
    testMatch:              ["**/*.test.ts", "**/*.test.tsx"],
    testPathIgnorePatterns: ["<rootDir>/tests/functional"],
    moduleNameMapper: {"^.+\\.(css|less)$": "<rootDir>/tests/cssStub.cjs"},
    coverageProvider: 'v8',
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/docs/**",
        "!src/util/*Error.ts",
        "!src/util/welcomeProject.ts",
    ],
    // transform: {
    //     '^.+\\.tsx?$': ['@swc/jest'],
    // }
};