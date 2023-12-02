import {FileContents, FileWriter} from '../generator/ProjectBuilder'

export default class CachingFileWriter implements FileWriter {

    private readonly fileCache: Map<string, FileContents> = new Map()
    constructor(private readonly fileWriter: FileWriter) {}

    writeFile(filepath: string, contents: FileContents): Promise<void> {
        if (contents === this.fileCache.get(filepath)) return Promise.resolve()
        this.fileCache.set(filepath, contents)
        return this.fileWriter.writeFile(filepath, contents)
    }

}