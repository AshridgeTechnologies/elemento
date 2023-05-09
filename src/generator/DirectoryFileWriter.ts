import {FileWriter} from './ProjectBuilder'
import fs from 'fs'
import path from 'path'

export default class DirectoryFileWriter implements FileWriter {
    constructor(private readonly localDirPath: string) {}

    async writeFile(filepath: string, contents: Uint8Array | string): Promise<void> {
        const fullPath = path.join(this.localDirPath, filepath)

        await fs.promises.mkdir(path.dirname(fullPath), {recursive: true})
        return fs.promises.writeFile(fullPath, contents)
    }
}