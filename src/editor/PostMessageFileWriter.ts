import {FileContents, FileWriter} from '../generator/ProjectBuilder'

type PostMessageTarget = {
    postMessage<T>(message: object): void
}
export default class PostMessageFileWriter implements FileWriter {
    constructor(private readonly messageTarget: PostMessageTarget) {
    }

    async writeFile(filePath: string, contents: FileContents): Promise<void> {
        this.messageTarget.postMessage({type: 'write', path: filePath, contents})
    }
}