import ThrottledCombinedFileWriter from '../../src/editor/ThrottledCombinedFileWriter'
import {CombinedFileWriter} from '../../src/generator/ProjectBuilder'
import {wait} from '../testutil/testHelpers'

const mockWriter = (delay: number = 0) => {
    return {writeFiles: jest.fn().mockImplementation(() => wait(delay))} as CombinedFileWriter
}

const failingMockWriter = (delay: number = 100) => {
    globalThis.console = {error: jest.fn()} as unknown as typeof globalThis.console
    return {
        writeFiles: jest.fn().mockImplementation(() => wait(delay).then(() => {
            throw new Error('Cannot do this')
        }))
    } as CombinedFileWriter
}

const contents1 = 'The file 1 contents'
const contents2 = 'The file 2 contents'

const contents3 = 'The file 3 contents'
let originalConsole = globalThis.console

afterEach(() => {
    globalThis.console = originalConsole
})

test('writes single new file to downstream CombinedFileWriter after interval', async () => {
    const mockFileWriter = mockWriter()
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
    await writer.writeFile('file1.txt', contents1)
    await wait(70)
    expect(mockFileWriter.writeFiles).not.toHaveBeenCalled()
    await wait(130)
    expect(mockFileWriter.writeFiles).toHaveBeenCalledWith({'file1.txt': contents1})
    await wait(100)
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(1)
})

test('writes multiple new files to downstream CombinedFileWriter after interval after last update', async () => {
    const mockFileWriter = mockWriter()
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
    await writer.writeFile('file1.txt', contents1)
    await wait(90)
    await writer.writeFile('file2.txt', contents2)
    await wait(80)
    expect(mockFileWriter.writeFiles).not.toHaveBeenCalled()
    await wait(40)
    expect(mockFileWriter.writeFiles).toHaveBeenCalledWith({'file1.txt': contents1, 'file2.txt': contents2})
    await wait(100)
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(1)
})

test('clears files after writing to downstream', async () => {
    const mockFileWriter = mockWriter()
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
    await writer.writeFile('file1.txt', contents1)
    await wait(120)
    await writer.writeFile('file2.txt', contents2)
    expect(mockFileWriter.writeFiles).toHaveBeenCalledWith({'file1.txt': contents1})
    await wait(120)
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(2)
    expect(mockFileWriter.writeFiles).toHaveBeenLastCalledWith({'file2.txt': contents2})
})

test('waits for downstream write to complete before writing and includes all updates to that point', async () => {
    const mockFileWriter = mockWriter(300)
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
    await writer.writeFile('file1.txt', contents1)
    await writer.writeFile('file2.txt', contents2)
    await wait(120)
    expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(1, {'file1.txt': contents1, 'file2.txt': contents2})

    // all these three updates should happen before the downstream write completes
    await writer.writeFile('file1.txt', contents1 + 1)
    await wait(10)
    await writer.writeFile('file1.txt', contents1 + 2)
    await wait(120)
    await writer.writeFile('file3.txt', contents3)
    await wait(500)  // long wait to ensure no extra write
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(2)
    expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(2, {'file1.txt': contents1 + 2, 'file3.txt': contents3})
})

test('updates status until downstream write complete', async () => {
    const mockFileWriter = mockWriter(100)
    const onStatusChange = jest.fn()
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100, onStatusChange)
    await writer.writeFile('file1.txt', contents1)
    expect(onStatusChange).toHaveBeenLastCalledWith('waiting')
    await wait(90)
    await writer.writeFile('file2.txt', contents2)
    expect(onStatusChange).toHaveBeenCalledTimes(1)

    await wait(120)
    expect(onStatusChange).toHaveBeenCalledTimes(2)
    expect(onStatusChange).toHaveBeenLastCalledWith('updating')

    await wait(100)
    expect(onStatusChange).toHaveBeenCalledTimes(3)
    expect(onStatusChange).toHaveBeenLastCalledWith('complete')
})

test('updates status if write fails', async () => {
    const mockFileWriter = failingMockWriter()
    const onStatusChange = jest.fn()
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100, onStatusChange)
    await writer.writeFile('file1.txt', contents1)
    expect(onStatusChange).toHaveBeenLastCalledWith('waiting')
    await wait(90)
    await writer.writeFile('file2.txt', contents2)
    expect(onStatusChange).toHaveBeenCalledTimes(1)

    await wait(120)
    expect(onStatusChange).toHaveBeenCalledTimes(2)
    expect(onStatusChange).toHaveBeenLastCalledWith('updating')

    await wait(100)
    expect(onStatusChange).toHaveBeenCalledTimes(3)
    expect(onStatusChange).toHaveBeenLastCalledWith(new Error('Cannot do this'))
})

test('flushes multiple new files (if any) immediately to downstream CombinedFileWriter', async () => {
    const mockFileWriter = mockWriter()
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
    await writer.writeFile('file1.txt', contents1)
    await wait(10)
    await writer.writeFile('file2.txt', contents2)
    await writer.flush()
    expect(mockFileWriter.writeFiles).toHaveBeenCalledWith({'file1.txt': contents1, 'file2.txt': contents2})
    await wait(130)
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(1)

    // should do nothing if no more updates
    await writer.flush()
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(1)

})

test('waits for downstream write but does not write if it fails', async () => {
    const mockFileWriter = failingMockWriter()
    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
    await writer.writeFile('file1.txt', contents1)
    await wait(120)
    expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(1, {'file1.txt': contents1})

    // this update should be stored before the downstream write completes
    await writer.writeFile('file1.txt', contents1 + 1)
    await wait(400)  // long wait to ensure no extra write
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('Failed to update files', new Error('Cannot do this'))
})

test('keeps files in a failed write and includes in next write unless further updated, until fixed', async () => {
    globalThis.console = {error: jest.fn()} as unknown as typeof globalThis.console
    let throwError = true
    const mockFileWriter =  {
        writeFiles: jest.fn().mockImplementation(() => wait(0).then(() => {
            if (throwError) throw new Error('Cannot do this')
        }))
    } as CombinedFileWriter

    const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
    await writer.writeFile('file1.txt', contents1)
    await writer.writeFile('file2.txt', contents2)
    await wait(120)
    expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(1, {'file1.txt': contents1, 'file2.txt': contents2})

    await writer.writeFile('file1.txt', contents1 + 1)
    await writer.writeFile('file3.txt', contents3)
    await wait(120)
    expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(2, {'file1.txt': contents1 + 1, 'file2.txt': contents2, 'file3.txt': contents3})

    throwError = false
    await writer.flush()
    expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(3, {'file1.txt': contents1 + 1, 'file2.txt': contents2, 'file3.txt': contents3})

    await writer.flush()
    expect(mockFileWriter.writeFiles).toHaveBeenCalledTimes(3)
})

// test('next update succeeds after failed write is fixed', async () => {
//     globalThis.console = {error: jest.fn()} as unknown as typeof globalThis.console
//     let throwError = true
//     const mockFileWriter = {
//         writeFiles: jest.fn().mockImplementation(() => wait(0).then(() => {
//             if (throwError) throw new Error('Cannot do this')
//         }))
//     } as CombinedFileWriter
//
//     const writer = new ThrottledCombinedFileWriter(mockFileWriter, 100)
//     await writer.writeFile('file1.txt', contents1)
//     await wait(120)
//     expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(1, {'file1.txt': contents1})
//
//     throwError = false
//
//     await writer.writeFile('file1.txt', contents1 + 1)
//     await wait(300)
//     expect(mockFileWriter.writeFiles).toHaveBeenNthCalledWith(2, {'file1.txt': contents1 + 1})
//
//
// })




