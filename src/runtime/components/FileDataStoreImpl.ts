import DataStore, {
    Add,
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    InvalidateAll,
    MultipleChanges,
    Update,
    Remove,
    UpdateNotification,
    UpdateType
} from '../DataStore'
import MemoryDataStore from './MemoryDataStore'
import Observable from 'zen-observable'
import SendObservable from '../../util/SendObservable'
import {isoDateReviver} from '../runtimeFunctions'

declare global {
    var showOpenFilePicker: (options: object) => any
    var showSaveFilePicker: (options: object) => any
}
const globalExternals = {
    showOpenFilePicker: (options: object) => global.showOpenFilePicker(options),
    showSaveFilePicker: (options: object) => global.showSaveFilePicker(options),
}

type Externals = { showOpenFilePicker: (options: object) => any; showSaveFilePicker: (options: object) => any }

const userCancelledFilePick = (e:any) => /*e instanceof DOMException &&*/ e.name === 'AbortError'

export default class FileDataStoreImpl implements DataStore {
    constructor(private externals: Externals = globalExternals) {}

    private inMemoryStore: MemoryDataStore = new MemoryDataStore()
    private fileHandle: FileSystemFileHandle | null = null
    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    async Open() {
        try {
            const [fileHandle] = await this.externals.showOpenFilePicker({id: 'elemento_fileDataStore'})
            const file = await fileHandle.getFile()
            const jsonText = await file.text()
            const data = JSON.parse(jsonText, isoDateReviver)
            this.inMemoryStore = new MemoryDataStore(data)
            this.fileHandle = fileHandle
            this.invalidateAllCollections()
        } catch (e: any) {
            if (!userCancelledFilePick(e)) {
                throw e
            }
        }
    }

    async SaveAs() {
        const options = {
            types: [
                {
                    description: 'JSON data files',
                    accept: {
                        'application/json': ['.json'],
                    },
                },
            ],
        }

        try {
            const fileHandle = await this.externals.showSaveFilePicker(options)
            await this.writeDataToFile(fileHandle)
            this.fileHandle = fileHandle
        } catch (e: any) {
            if (!userCancelledFilePick(e)) {
                throw e
            }
        }
    }
    async Save() {
        if (this.fileHandle) {
            await this.writeDataToFile(this.fileHandle)
        } else {
            await this.SaveAs()
        }
    }

    async New() {
        this.inMemoryStore = new MemoryDataStore()
        this.fileHandle = null
        this.invalidateAllCollections()
    }

    async query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        return await this.inMemoryStore.query(collection, criteria)
    }

    async add(collection: CollectionName, id: Id, item: DataStoreObject) {
        await this.inMemoryStore.add(collection, id, item)
        this.notify(collection, Add, id, item)
        if (this.fileHandle) {
            await this.Save()
        }
    }

    async addAll(collection: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        await this.inMemoryStore.addAll(collection, items)
        this.notify(collection, MultipleChanges)
        if (this.fileHandle) {
            await this.Save()
        }
    }

    async update(collection: CollectionName, id: Id, changes: object) {
        await this.inMemoryStore.update(collection, id, changes)
        this.notify(collection, Update, id, changes)
        if (this.fileHandle) {
            await this.Save()
        }
    }

    async remove(collection: CollectionName, id: Id) {
        await this.inMemoryStore.remove(collection, id)
        this.notify(collection, Remove, id)
        if (this.fileHandle) {
            await this.Save()
        }
    }

    async getById(collection: CollectionName, id: Id, nullIfNotFound = false) {
        return await this.inMemoryStore.getById(collection, id, nullIfNotFound)
    }

    observable(collection: CollectionName): Observable<UpdateNotification> {
        let observable = this.collectionObservables.get(collection)
        if (!observable) {
            observable = new SendObservable()
            this.collectionObservables.set(collection, observable)
        }
        return observable
    }

    private invalidateAllCollections() {
        this.collectionObservables.forEach((obs, collection) => obs.send({collection, type: InvalidateAll}))
    }

    private notify(collection: CollectionName, type: UpdateType, id?: Id, changes?: DataStoreObject ) {
        const observable = this.collectionObservables.get(collection)
        observable?.send({collection, type, id, changes})
    }

    private async writeDataToFile (fileHandle: any) {
        const writable = await fileHandle.createWritable()
        const data = await (this.inMemoryStore.getAllData())
        await writable.write(JSON.stringify(data))
        await writable.close()
    }


}
