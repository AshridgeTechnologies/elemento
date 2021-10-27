const path = require('path')

function resolveSnapshotPath(testPath, snapshotExtension) {
    const testSourcePath = testPath.replace('build/', '').replace('.js', '')

    const testDirectory = path.dirname(testSourcePath)
    const testFilename = path.basename(testSourcePath)

    return `${testDirectory}/__snapshots__/${testFilename}${snapshotExtension}`
}

function resolveTestPath(snapshotFilePath, snapshotExtension) {
    const testSourceFile = snapshotFilePath
        .replace(`/__snapshots__`, '')
        .replace(snapshotExtension, '.js')

    return `build/${testSourceFile}`
}

module.exports = {
    resolveSnapshotPath,
    resolveTestPath,
    testPathForConsistencyCheck: 'build/src/__test__/Post.spec.js'
}