// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    testDir: 'build/tests/functional',
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
    },
};

module.exports = config;