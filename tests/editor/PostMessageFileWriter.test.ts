import PostMessageFileWriter from '../../src/editor/PostMessageFileWriter'

test('posts file path to given target', async () => {
    const postMessage = jest.fn()
    const messageTarget = {postMessage}
    const writer = new PostMessageFileWriter(messageTarget)
    const contents = 'The file contents'
    await expect(writer.writeFile('dir1/TheApp.js', contents)).resolves.toBe(undefined)
    expect(postMessage).toHaveBeenCalledWith({type: 'write', path: 'dir1/TheApp.js'})
})

test('uses dirPath if given', async () => {
    const postMessage = jest.fn()
    const messageTarget = {postMessage}
    const writer = new PostMessageFileWriter(messageTarget, 'subDir/1')
    const contents = 'The file contents'
    await expect(writer.writeFile('dir1/TheApp.js', contents)).resolves.toBe(undefined)
    expect(postMessage).toHaveBeenCalledWith({type: 'write', path: 'subDir/1/dir1/TheApp.js'})
})
