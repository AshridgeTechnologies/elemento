import {expect, test, vi} from 'vitest'
import MultiFileWriter from '../../src/generator/MultiFileWriter'
import {FileWriter} from '../../src/generator/ProjectBuilder'

test('writes file to all the given writers', async () => {
    const writer1: FileWriter = {writeFile: vi.fn().mockResolvedValue(undefined)}
    const writer2: FileWriter = {writeFile: vi.fn().mockResolvedValue(undefined)}
    const writer3: FileWriter = {writeFile: vi.fn().mockResolvedValue(undefined)}

    const writer = new MultiFileWriter(writer1, writer2, writer3)
    await writer.writeFile('dir1/File1.txt', 'File contents')
    expect(writer1.writeFile).toHaveBeenCalledWith('dir1/File1.txt', 'File contents')
    expect(writer2.writeFile).toHaveBeenCalledWith('dir1/File1.txt', 'File contents')
    expect(writer3.writeFile).toHaveBeenCalledWith('dir1/File1.txt', 'File contents')
})


