import {FileContents, FileWriter} from '../generator/ProjectBuilder'

export default class HttpFileWriter implements FileWriter {
    constructor(private readonly serverUrl: string | (() => string), private readonly firebaseAccessToken: string | (() => string | null) | null = null) {
    }
    writeFile(filepath: string, contents: FileContents): Promise<void> {
        const baseUrl = typeof this.serverUrl === 'function' ? this.serverUrl() : this.serverUrl
        const accessToken = typeof this.firebaseAccessToken === 'function' ? this.firebaseAccessToken() : this.firebaseAccessToken
        const url = `${baseUrl}/${filepath}`
        const headers = accessToken ? {
            'x-firebase-access-token': accessToken
        } : undefined
        return fetch(url, {method: "PUT", body: contents, headers}).then( () => {} )
    }

}