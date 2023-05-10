import {RuntimeLoader} from '../generator/ProjectBuilder'

export default class BrowserRuntimeLoader implements RuntimeLoader {
    constructor(private readonly runtimeServerUrl: string) {
    }

    getFile(filename: string): Promise<string> {
        const path = filename.startsWith('server') ? 'serverRuntime' : 'runtime'
        const url = `${this.runtimeServerUrl}/${path}/${filename}`
        return fetch(url).then( resp => resp.text())
    }

}