import PostMessageFileWriter from '../../src/editor/PostMessageFileWriter'

test('posts file in message file to given target', async () => {
    const postMessage = jest.fn()
    const messageTarget = {postMessage}
    const writer = new PostMessageFileWriter(messageTarget)
    const contents = 'The file contents'
    await expect(writer.writeFile('dir1/TheApp.js', contents)).resolves.toBe(undefined)
    expect(postMessage).toHaveBeenCalledWith({type: 'write', path: 'dir1/TheApp.js', contents})
})
