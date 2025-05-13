import {RuntimeLoader} from '../generator/ProjectBuilder'

export class StandardRuntimeLoader implements RuntimeLoader {
    private clientText?: string
    private serverText?: string

    async clientRuntime(): Promise<string> {
        return this.clientText ??= await this.downloadFile('/lib/runtime.js')
    }

    async serverRuntime(): Promise<string> {
        return this.serverText ??= await this.downloadFile('/lib/serverRuntime.mjs')
    }

    private downloadFile(path: string) {
        return fetch(path).then( resp => resp.text())
    }

}
