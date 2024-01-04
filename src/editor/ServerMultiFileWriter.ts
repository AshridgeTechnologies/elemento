import {FileContents, FileWriter, ServerFileWriter} from '../generator/ProjectBuilder'
import ThrottledCombinedFileWriter, {Status} from './ThrottledCombinedFileWriter'
import HttpCombinedFileWriter from './HttpCombinedFileWriter'
import CachingFileWriter from './CachingFileWriter'
import MultiFileWriter from '../generator/MultiFileWriter'

export type Properties = Readonly<{
    previewUploadUrl: () => string,
    previewPassword: ()=> Promise<string>,
    onServerUpdateStatusChange?: (newStatus: Status) => void,
    delay?: number
    writers?: FileWriter[]
}>
export default class ServerMultiFileWriter implements ServerFileWriter {
    private readonly previewServerWriter: ThrottledCombinedFileWriter
    private readonly writer: MultiFileWriter

    constructor(props: Properties) {
        const {delay = 1000, writers = []} = props
        const combinedWriter = new HttpCombinedFileWriter(props.previewUploadUrl, props.previewPassword)
        this.previewServerWriter = new ThrottledCombinedFileWriter(combinedWriter, delay, props.onServerUpdateStatusChange)
        const cachingWriter = new CachingFileWriter(this.previewServerWriter, 'server/')
        this.writer = new MultiFileWriter(cachingWriter, ...writers)
    }

    clean(): Promise<void> {
        return this.previewServerWriter.clean()
    }

    flush(): Promise<void> {
        return this.previewServerWriter.flush()
    }

    writeFile(filepath: string, contents: FileContents): Promise<void> {
        return this.writer.writeFile(filepath, contents)
    }
}