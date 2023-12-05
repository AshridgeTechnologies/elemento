import {CombinedFileWriter, FileContents} from '../generator/ProjectBuilder'
import {noop} from '../util/helpers'

// Must match delimiter strings expected in elemento-app-server
const FILE_HEADER_PREFIX = '//// File: '
const EOF_DELIMITER = '//// End of file'

export default class HttpCombinedFileWriter implements CombinedFileWriter {
    constructor(private readonly urlFn: () => string, private readonly accessTokenFn: () => string | null) {
    }

    writeFiles(files: { [p: string]: FileContents }): Promise<void> {
        const accessToken = this.accessTokenFn()
        const headers = accessToken ? {
            'x-firebase-access-token': accessToken
        }: undefined
        const fileItems = Object.entries(files).map(([name, contents]) => FILE_HEADER_PREFIX + name + '\n' + contents.toString() + '\n' + EOF_DELIMITER )
        const contents = fileItems.join('\n')
        return fetch(this.urlFn(), {method: 'PUT', body: contents, headers}).then( resp => {
            if (!resp.ok) {
                throw new Error(resp.statusText + ' ' + resp.status)
            }
        } )
    }
}