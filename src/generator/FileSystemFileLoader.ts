import {FileContents, FileLoader} from './ProjectBuilder'
import fs from 'fs'

export default class FileSystemFileLoader implements FileLoader {
    constructor(private readonly rootDirPath: string) {
    }

    listFiles(dirPath: string): Promise<string[]> {
        return fs.promises.readdir(`${this.rootDirPath}/${dirPath}`)
    }

    readFile(filePath: string): Promise<FileContents> {
        return fs.promises.readFile(`${this.rootDirPath}/${filePath}`).then( buf => new Uint8Array(buf.buffer))
    }
}