import {CombinedFileWriter, FileContents, FileWriter} from '../generator/ProjectBuilder'
import {noop, wait} from '../util/helpers'

export type Status = 'waiting' | 'updating' | 'complete' | Error
/**
 * Waits until interval ms have elapsed after the last writeFile call before writing to the downstream writer.
 * Also waits until the previous downstream write has completed before starting another.
 * Each file update starts a promise to wait for the interval, but if further updates have happened when the promise resolves, it is ignored
 */
export default class ThrottledCombinedFileWriter implements FileWriter {
    private filesPending: {[filepath: string]: FileContents} = {}
    private writePromise: Promise<void> = Promise.resolve(undefined)
    private updateCount = 0
    private status: Status = 'complete'

    constructor(private readonly combinedWriter: CombinedFileWriter,
                private readonly interval: number,
                private readonly onStatusChange: (status: Status) => void = noop) {
    }

    async writeFile(filepath: string, contents: FileContents): Promise<void> {
        this.filesPending = {...this.filesPending, [filepath]: contents }
        this.updateCount++
        this.scheduleNextWrite()
        this.updateStatus('waiting')
    }

    private scheduleNextWrite() {
        // ensure a write promise will just do nothing if more file changes have come in or has been flushed
        const updateCountWhenScheduled = this.updateCount
        const writeIfNoMoreUpdates = () => {
            if (this.updateCount === updateCountWhenScheduled && this.hasPendingFiles()) {
                this.writePendingFiles()
            }
        }

        wait(this.interval).then( () => this.writePromise ).then(writeIfNoMoreUpdates)
    }

    private hasPendingFiles() {
        return Object.keys(this.filesPending).length > 0
    }

    private writePendingFiles() {
        const filesToWrite = this.filesPending
        this.filesPending = {}
        this.updateStatus('updating')
        this.writePromise = this.combinedWriter.writeFiles(filesToWrite)
            .then( ()=> {
                this.updateStatus('complete')
            })
            .catch( (err: Error)=> {
                this.filesPending = {...filesToWrite, ...this.filesPending}
                this.updateStatus(err)
                console.error('Failed to update files', err)
            })
    }

    private updateStatus(newStatus: Status) {
        if (newStatus !== this.status) {
            this.status = newStatus
            this.onStatusChange(newStatus)
        }
    }

    async flush() {
        if (this.hasPendingFiles()) {
            await this.writePendingFiles()
        }
    }
}
