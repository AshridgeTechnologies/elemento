import {FileContents, FileWriter} from '../generator/ProjectBuilder'

export default class CachingFileWriter implements FileWriter {

    private readonly fileCache: Map<string, FileContents> = new Map()
    constructor(private readonly fileWriter: FileWriter, private readonly pathPrefix?: string) {}

    writeFile(filepath: string, contents: FileContents): Promise<void> {
        const filepathWithPrefix = (this.pathPrefix ?? '') + filepath
        if (contents === this.fileCache.get(filepathWithPrefix)) return Promise.resolve()
        this.fileCache.set(filepathWithPrefix, contents)
        return this.fileWriter.writeFile(filepathWithPrefix, contents)
    }

}