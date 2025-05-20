import DataStore, {
    Add,
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    InvalidateAll,
    MultipleChanges, queryMatcher,
    Remove,
    Update,
    UpdateNotification,
    UpdateType
} from '../DataStore'
import {currentUser, onAuthChange} from './authentication'

import Observable from 'zen-observable'
import SendObservable from '../../util/SendObservable'
import ReconnectingWebSocket from 'reconnecting-websocket'
import {CellOrUndefined, createMergeableStore, MapCell, Store} from 'tinybase'
import {createLocalPersister} from 'tinybase/persisters/persister-browser'
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client'
import {mapObjIndexed, mergeDeepRight} from 'ramda'
import CollectionConfig, {parseCollections} from '../../shared/CollectionConfig'
import {addIdToItem, convertFromDbData, convertToDbData} from '../../shared/convertData'
import {mapValues} from 'radash'

const SERVER_SCHEME = 'ws://';

const createStore = async (pathId: string, persist: boolean, sync: boolean, syncServer: string) => {
    const store = createMergeableStore()
    if (persist) {
        const persister = createLocalPersister(store, 'local://' + syncServer + pathId)
        await persister.startAutoPersisting();
    }

    if (sync) {
        const webSocket = new ReconnectingWebSocket(SERVER_SCHEME + syncServer + pathId, ['auth-token-1', 'tb']) as unknown as WebSocket
        // Auth token passed in protocol header - see discussion at https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
        const synchronizer = await createWsSynchronizer(
            store,
            webSocket,
            1
        );
        await synchronizer.startSync()

        // If the websocket reconnects in the future, do another explicit sync.
        synchronizer.getWebSocket().addEventListener('open', () => {
            synchronizer.load().then(() => synchronizer.save());
        })
    }

    return store
}

type Properties = {collections: string, databaseName: string, persist?: boolean, sync?: boolean, syncServer?: string}

export default class TinyBaseDataStoreImpl implements DataStore {
    private initialised = false
    private theDb: Store | null = null
    private readonly collections: CollectionConfig[]
    private authObserver: any = null

    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
    }

    get db(): Store {
        if (!this.theDb) {
            throw new Error('Not initialised')
        }
        return this.theDb
    }

    async init(collectionName?: CollectionName) {
        if (!this.initialised) {
            const {databaseName, persist = false, sync = false, syncServer = globalThis.location?.origin + '/do/'} = this.props
            this.theDb = await createStore(databaseName, persist, sync, syncServer)
            this.initialised = true
        }

        if (collectionName && !this.collections.some( coll => coll.name === collectionName)) {
            throw new Error(`Collection '${collectionName}' not found`)
        }
    }

    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    private getCurrentUser() {
        return currentUser()
    }
    async getById(collectionName: CollectionName, id: Id, nullIfNotFound = false) {
        await this.init(collectionName)
        const jsonText = this.db.getCell(collectionName, id.toString(), 'json_data') as string | undefined
        if (jsonText === undefined) {
            if (nullIfNotFound) {
                return null
            }
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }

        const data = JSON.parse(jsonText)
        return convertFromDbData(data)
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        await this.init(collectionName)
        const dbItem = convertToDbData(addIdToItem(item, id))
        this.db.setCell(collectionName, id.toString(), 'json_data', JSON.stringify(dbItem))
        this.notify(collectionName, Add, id, item)
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        await this.init(collectionName)
        const toDbItem = (item: DataStoreObject, id: Id) => convertToDbData(addIdToItem(item, id))
        const dbItems = Object.values(mapObjIndexed( toDbItem, items))
        this.db.transaction(() => {
            Object.values(dbItems).forEach(item => {
                this.db.setCell(collectionName, item.id, 'json_data', JSON.stringify(item))
            })
        })
        this.notify(collectionName, MultipleChanges)
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        await this.init(collectionName)

        const updateCell: MapCell = (cell: CellOrUndefined) => {
            if (cell === undefined) {
                throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
            }
            const existingItem = convertFromDbData(JSON.parse(cell as string))
            const updatedItem = mergeDeepRight(existingItem, changes)
            return JSON.stringify(convertToDbData(updatedItem))
        }
        this.db.setCell(collectionName, id.toString(), 'json_data', updateCell)
        this.notify(collectionName, Update, id, changes)
    }

    async remove(collectionName: CollectionName, id: Id) {
        await this.init(collectionName)
        this.db.delRow(collectionName, id.toString())
        this.notify(collectionName, Remove, id)
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        await this.init(collectionName)
        const collection = mapValues(this.db.getTable(collectionName), row => convertFromDbData(JSON.parse(row.json_data as string)))
        return Object.values(collection).filter( queryMatcher(criteria))
    }

    observable(collection: CollectionName): Observable<UpdateNotification> {
        let observable = this.collectionObservables.get(collection)
        if (!observable) {
            observable = new SendObservable()
            this.collectionObservables.set(collection, observable)
            if (!this.authObserver) {
                this.authObserver = onAuthChange(() => {
                    this.notifyAll(InvalidateAll)
                })
            }
        }
        return observable
    }

    private notify(collection: CollectionName, type: UpdateType, id?: Id, changes?: DataStoreObject ) {
        const observable = this.collectionObservables.get(collection)
        observable?.send({collection, type, id, changes})
    }

    private notifyAll(type: UpdateType) {
        this.collectionObservables.forEach( (observable, collection) => observable.send({collection, type}))
    }

    async test_clear() {
        await this.init()
        this.db.delTables()
    }
}
