import FS from '@isomorphic-git/lightning-fs'
import {ASSET_DIR} from '../shared/constants'

export class LocalAssetReader {
    private cbfs: FS
    private readonly fs: FS.PromisifiedFS

    constructor() {
        this.cbfs = new FS('projectFileSystem')
        this.fs = this.cbfs.promises
    }
    readAssetFile(projectName: string, path: string) {
        return this.fs.readFile(`/${projectName}/${ASSET_DIR}/${path}`) as Promise<Uint8Array>
    }
}