import {FileContents, FileWriter} from '../generator/ProjectBuilder'

type PostMessageTarget = {
    postMessage<T>(message: object): void
}
export default class PostMessageFileWriter implements FileWriter {
    constructor(private readonly messageTarget: () => PostMessageTarget, private readonly dirPath?: string) {
    }

    // contents not sent as file is read from filesystem
    async writeFile(filePath: string, contents: FileContents): Promise<void> {
        const fullPath = this.dirPath ? `${this.dirPath}/${filePath}` : filePath
        this.messageTarget().postMessage({type: 'write', path: fullPath})
    }
}
