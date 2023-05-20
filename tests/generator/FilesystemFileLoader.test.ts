import FileSystemFileLoader from '../../src/generator/FileSystemFileLoader'
import os from 'os'
import fs from 'fs'

let rootDirPath: string, subDirName: string, subDirPath: string

beforeAll(() => {
    const tempDir = os.tmpdir()
    const localName = 'FileSystemFileLoader.test'
    rootDirPath = `${tempDir}/${localName}`
    subDirName = 'somefiles'
    subDirPath = `${rootDirPath}/${subDirName}`
    fs.rmSync(subDirPath, {recursive: true, force: true})
    fs.mkdirSync(subDirPath, {recursive: true})
    fs.writeFileSync(`${subDirPath}/file1.jpg`, new Uint8Array([1,2,3]))
    fs.writeFileSync(`${subDirPath}/file2.md`, 'File 2', 'utf8')
})

test('lists files in a directory', async () => {
    const loader = new FileSystemFileLoader(rootDirPath)
    await expect(loader.listFiles(subDirName)).resolves.toStrictEqual(['file1.jpg', 'file2.md'])
})

test('reads file from a path', async () => {
    const loader = new FileSystemFileLoader(rootDirPath)
    const fileContents = await loader.readFile(`${subDirName}/file1.jpg`)
    await expect(fileContents).toStrictEqual(new Uint8Array([1,2,3]))
})
