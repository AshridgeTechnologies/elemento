import DataStore, {
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    InvalidateAll,
    InvalidateAllQueries,
    UpdateNotification
} from '../DataStore'
import MemoryDataStore from './MemoryDataStore'
import Observable from 'zen-observable'
import SendObservable from '../SendObservable'

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
            const data = JSON.parse(jsonText)
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
        this.invalidateCollectionQueries(collection)
        if (this.fileHandle) {
            await this.Save()
        }
    }

    async update(collection: CollectionName, id: Id, changes: object) {
        await this.inMemoryStore.update(collection, id, changes)
        this.invalidateCollectionQueries(collection)
        if (this.fileHandle) {
            await this.Save()
        }
    }

    async remove(collection: CollectionName, id: Id) {
        await this.inMemoryStore.remove(collection, id)
        this.invalidateCollectionQueries(collection)
        if (this.fileHandle) {
            await this.Save()
        }
    }

    async getById(collection: CollectionName, id: Id) {
        return await this.inMemoryStore.getById(collection, id)
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

    private invalidateCollectionQueries(collection: CollectionName) {
        let observable = this.collectionObservables.get(collection)
        if (observable) {
            observable.send({collection, type: InvalidateAllQueries})
        }
    }

    private async writeDataToFile (fileHandle: any) {
        const writable = await fileHandle.createWritable()
        const data = await (this.inMemoryStore.getAllData())
        await writable.write(JSON.stringify(data))
        await writable.close()
    }


}
