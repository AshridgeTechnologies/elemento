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
    private writePromise: Promise<undefined | Error> = Promise.resolve(undefined)
    private updateCount = 0
    private status: Status = 'complete'

    constructor(private readonly fileWriter: CombinedFileWriter,
                private readonly interval: number,
                private readonly onStatusChange: (status: Status, message?: string) => void = noop) {
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
        const writeIfNoMoreUpdates = (maybeErr: Error | undefined) => {
            if (this.updateCount === updateCountWhenScheduled && this.hasPendingFiles() && !maybeErr) {
                this.writePromise = this.writePendingFiles()
            }
        }

        const intervalPromise = wait(this.interval)
        // console.log('scheduleNextWrite', this.writePromise)
        // this.writePromise.then(()=> console.log('write ok'), (err)=> console.log('write err', err))
        Promise.all([intervalPromise, this.writePromise])
            .then(([_, writeResult]) => writeIfNoMoreUpdates(writeResult))
            .catch(noop) // already logged in writePendingFiles
        const resetWritePromise = () => {
            this.writePromise = Promise.resolve(undefined)
        }
        this.writePromise.then( resetWritePromise, resetWritePromise )
    }

    private hasPendingFiles() {
        return Object.keys(this.filesPending).length > 0
    }

    private writePendingFiles() {
        const filesToWrite = this.filesPending
        this.filesPending = {}
        this.updateStatus('updating')
        return this.fileWriter.writeFiles(filesToWrite)
            .then( ()=> {
                this.updateStatus('complete')
                return undefined
            })
            .catch( (err: Error)=> {
                this.filesPending = {...filesToWrite, ...this.filesPending}
                this.updateStatus(err)
                console.error('Failed to update files', err)
                return err
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