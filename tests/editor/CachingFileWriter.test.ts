import CachingFileWriter from '../../src/editor/CachingFileWriter'
import {FileWriter} from '../../src/generator/ProjectBuilder'

const mockWriter = () => {
    const writeFile = jest.fn()
    writeFile.mockResolvedValue(undefined)
    return {writeFile} as FileWriter
}

const contents = 'The file contents'

test('writes new file to downstream FileWriter', async () => {
    const mockFileWriter = mockWriter()
    const writer = new CachingFileWriter(mockFileWriter)
    await writer.writeFile('file1.txt', contents)
    expect(mockFileWriter.writeFile).toHaveBeenCalledWith('file1.txt', contents)
})

test('does not write unchanged file to downstream FileWriter', async () => {
    const mockFileWriter = mockWriter()
    const writer = new CachingFileWriter(mockFileWriter)
    await writer.writeFile('file1.txt', contents)
    await writer.writeFile('file1.txt', contents)
    expect(mockFileWriter.writeFile).toHaveBeenCalledTimes(1)
})

test('writes changed file to downstream FileWriter', async () => {
    const mockFileWriter = mockWriter()
    const writer = new CachingFileWriter(mockFileWriter)
    await writer.writeFile('file1.txt', contents)
    await writer.writeFile('file1.txt', contents + 'updated')
    expect(mockFileWriter.writeFile).toHaveBeenCalledTimes(2)
    expect(mockFileWriter.writeFile).toHaveBeenCalledWith('file1.txt', contents)
    expect(mockFileWriter.writeFile).toHaveBeenCalledWith('file1.txt', contents + 'updated')
})
