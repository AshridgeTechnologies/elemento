import type { PlaywrightTestConfig } from '@playwright/test'

const baseURL = process.env.PW_BASE_URL ?? 'http://localhost:1234/'
console.log('baseUrl: ', baseURL)

const config: PlaywrightTestConfig = {
    testDir: 'tests/functional',
    timeout: 10000,
    use: {
        baseURL,
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
        contextOptions: {
            permissions: ['clipboard-read', 'clipboard-write']
        },
    },
}

export default config