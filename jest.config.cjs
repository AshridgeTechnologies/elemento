/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment:        'node',
    verbose:                true,
    roots:                  ['tests'],
    testMatch:              ["**/*.test.ts", "**/*.test.tsx"],
    testPathIgnorePatterns: ["<rootDir>/tests/functional"],
    resolver: '<rootDir>/jest.resolver.cjs',
    moduleNameMapper: {"^.+\\.(css|less)$": "<rootDir>/tests/cssStub.cjs"},
    coverageProvider: 'v8',
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/docs/**",
        "!src/util/*Error.ts",
        "!src/util/initialProjects.ts",
    ],
    // transform: {
    //     '^.+\\.tsx?$': ['@swc/jest'],
    // }
    setupFiles: [
        "<rootDir>/tests/setupTests.ts"
    ]
};
