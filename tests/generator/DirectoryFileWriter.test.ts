import DirectoryFileWriter from '../../src/generator/DirectoryFileWriter'
import os from 'os'
import fs from 'fs'

let localDirPath: string

afterEach(() => {
    if (fs.existsSync(localDirPath)) {
        fs.rmSync(localDirPath, { recursive: true, force: true })
    }
})

test('writes new file and creates directory and overwrites file', async () => {
    localDirPath = `${os.tmpdir()}/DirectoryFileWriter.test.${Date.now()}`

    const writer = new DirectoryFileWriter(localDirPath)
    await writer.writeFile('a.txt', 'File A')
    expect(fs.readFileSync(`${localDirPath}/a.txt`, 'utf8')).toBe('File A')

    await writer.writeFile('a.txt', 'File A updated')
    expect(fs.readFileSync(`${localDirPath}/a.txt`, 'utf8')).toBe('File A updated')
})

test('writes new file in nested directory and creates directory', async () => {
    localDirPath = `${os.tmpdir()}/DirectoryFileWriter.test.${Date.now()}`

    const writer = new DirectoryFileWriter(localDirPath)
    await writer.writeFile('subdir/a.txt', 'File A')
    expect(fs.readFileSync(`${localDirPath}/subdir/a.txt`, 'utf8')).toBe('File A')
})
