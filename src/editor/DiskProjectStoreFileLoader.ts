import {DiskProjectStoreInterface} from './DiskProjectStore'
import {FileContents, FileLoader} from '../generator/ProjectBuilder'

export default class DiskProjectStoreFileLoader implements FileLoader{
    constructor(private readonly store: DiskProjectStoreInterface) {
    }

    listFiles(dirPath: string): Promise<string[]> {
        return this.store.getFileNames(dirPath)
    }

    readFile(filePath: string): Promise<FileContents> {
        return this.store.readFile(filePath)
    }
}