import {FileContents, FileWriter} from '../generator/ProjectBuilder'

export default class HttpFileWriter implements FileWriter {
    constructor(private readonly serverUrl: string | (() => string)) {
    }
    writeFile(filepath: string, contents: FileContents): Promise<void> {
        const baseUrl = typeof this.serverUrl === 'function' ? this.serverUrl() : this.serverUrl
        const url = `${baseUrl}/${filepath}`
        return fetch(url, {method: "PUT", body: contents,}).then( () => {} )
    }

}