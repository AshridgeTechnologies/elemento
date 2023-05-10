import {FileContents, FileWriter} from '../generator/ProjectBuilder'

export default class HttpFileWriter implements FileWriter {
    constructor(private readonly serverUrl: string) {
    }
    writeFile(filepath: string, contents: FileContents): Promise<void> {
        const url = `${this.serverUrl}/${filepath}`
        return fetch(url, {method: "PUT", body: contents,}).then( () => {} )
    }

}