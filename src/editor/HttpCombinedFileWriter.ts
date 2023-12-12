import {CombinedFileWriter, FileContents} from '../generator/ProjectBuilder'

// Must match delimiter strings expected in elemento-app-server
const FILE_HEADER_PREFIX = '//// File: '
const EOF_DELIMITER = '//// End of file'

const checkResponse = (resp: Response) => {
    if (!resp.ok) {
        return resp.text().then((text) => {
            throw new Error(resp.status + ' ' + text)
        })
    }
}

export default class HttpCombinedFileWriter implements CombinedFileWriter {
    constructor(private readonly urlFn: () => string, private readonly passwordFn: () => Promise<string>) {
    }

    async writeFiles(files: { [p: string]: FileContents }): Promise<void> {
        const headers = await this.headers()
        const fileItems = Object.entries(files).map(([name, contents]) => FILE_HEADER_PREFIX + name + '\n' + contents.toString() + '\n' + EOF_DELIMITER )
        const contents = fileItems.join('\n')
        return fetch(this.urlFn(), {method: 'PUT', body: contents, headers}).then( checkResponse )
    }

    async clean(): Promise<void> {
        const headers = await this.headers()
        return fetch(this.urlFn() + '/clear', {method: 'POST', headers}).then( checkResponse )
    }

    private async headers() {
        const password = await this.passwordFn()
        return password ? {
            'x-preview-password': password
        } : undefined
    }
}