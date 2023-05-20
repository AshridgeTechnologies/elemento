import {FileContents, FileWriter} from './ProjectBuilder'

export default class MultiFileWriter implements FileWriter {
    private writers: FileWriter[]
    constructor(...writers: FileWriter[]) {
        this.writers = writers
    }

    async writeFile(filepath: string, contents: FileContents): Promise<void> {
        await Promise.all( this.writers.map( w => w.writeFile(filepath, contents)))
    }

}