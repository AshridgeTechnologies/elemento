/** @type {import('@jest/types').Config.InitialOptions} */
const standardConfig = require('./jest.config.cjs')
module.exports = {...standardConfig,
    transform: {
        '^.+\\.tsx?$': ['@swc/jest'],
    }
};