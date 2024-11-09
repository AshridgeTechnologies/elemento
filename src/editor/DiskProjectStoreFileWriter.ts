import {DiskProjectStoreInterface} from "./DiskProjectStore"
import {FileContents, FileWriter} from "../generator/ProjectBuilder"

export default class DiskProjectStoreFileWriter implements FileWriter {
    constructor(private readonly store: DiskProjectStoreInterface, private readonly topLevelPath: string) {
    }

    writeFile(filepath: string, contents: FileContents): Promise<void> {
        const fullPath = `${this.topLevelPath}/${filepath}`
        return typeof contents === 'string'
            ? this.store.writeTextFile(fullPath, contents, true)
            : this.store.writeFile(fullPath, contents, true)
    }
}
