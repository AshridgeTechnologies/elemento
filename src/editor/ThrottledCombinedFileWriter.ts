import {CombinedFileWriter, FileContents, FileWriter} from '../generator/ProjectBuilder'
import {noop, wait} from '../util/helpers'

export type Status = 'waiting' | 'updating' | 'complete' | 'error'
/**
 * Waits until interval ms have elapsed after the last writeFile call before writing to the downstream writer.
 * Also waits until the previous downstream write has completed before starting another.
 * Each file update starts a promise to wait for the interval, but if further updates have happened when the promise resolves, it is ignored
 */
export default class ThrottledCombinedFileWriter implements FileWriter {
    private readonly filesPending: Map<string, FileContents> =
        new Map()
    private writePromise: Promise<void> = Promise.resolve()
    private updateCount = 0
    private status: Status = 'complete'

    constructor(private readonly fileWriter: CombinedFileWriter,
                private readonly interval: number,
                private readonly onStatusChange: (status: Status, message?: string) => void = noop) {
    }

    async writeFile(filepath: string, contents: FileContents): Promise<void> {
        this.filesPending.set(filepath, contents)
        this.updateCount++
        this.scheduleNextWrite()
        this.updateStatus('waiting')
    }

    private scheduleNextWrite() {
        // ensure a write promise will just do nothing if more file changes have come in
        const updateCountWhenScheduled = this.updateCount
        const writeIfNoMoreUpdates = () => {
            if (this.updateCount === updateCountWhenScheduled) {
                this.writePromise = this.writePendingFiles()
            }
        }

        const intervalPromise = wait(this.interval)
        Promise.all([intervalPromise, this.writePromise]).then(writeIfNoMoreUpdates)
    }

    private writePendingFiles() {
        const filesToWrite = Object.fromEntries(this.filesPending.entries())
        this.filesPending.clear()
        this.updateStatus('updating')
        return this.fileWriter.writeFiles(filesToWrite)
            .then( ()=> this.updateStatus('complete'))
            .catch( (err: Error)=> this.updateStatus('error', err.message ) )
    }

    private updateStatus(newStatus: Status, message?: string) {
        if (newStatus !== this.status) {
            this.status = newStatus
            this.onStatusChange(newStatus, message)
        }
    }
}