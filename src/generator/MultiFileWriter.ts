import {FileContents, FileWriter} from './ProjectBuilder'

export default class MultiFileWriter implements FileWriter {
    private writers: FileWriter[]
    constructor(...writers: FileWriter[]) {
        this.writers = writers
    }

    async writeFile(filepath: string, contents: FileContents): Promise<void> {
        for( const writer of this.writers) {
            await writer.writeFile(filepath, contents)
        }
    }

}
