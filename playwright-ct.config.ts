import baseConfig from './playwright.config.js'

export default Object.assign(baseConfig, {testMatch: /.*\.(pwtest)\.(ts|tsx)/})
