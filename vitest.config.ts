import {defineConfig} from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['./vitest-setup.js'],
        include: ['tests/**/*.test.ts?(x)'],
        exclude: ['**/tests/functional', '**/tests/util'],
        pool: 'threads'
    }
})
