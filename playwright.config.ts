import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
    testDir: 'tests/functional',
    timeout: 10000,
    use: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
    },
};
export default config;