const {defineConfig} = require('jest')

module.exports = defineConfig({
    setupFilesAfterEnv: ['<rootDir>/tests/setup-jest.js'],
    testTimeout: 10000
})
