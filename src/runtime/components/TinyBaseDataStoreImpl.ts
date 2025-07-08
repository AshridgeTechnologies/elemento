import DataStore, {
    Add, AuthStatusValues,
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    InvalidateAll,
    MultipleChanges, NullToken, queryMatcher,
    Remove,
    Update,
    UpdateNotification,
    UpdateType
} from '../../shared/DataStore'
import {currentUser, getIdToken, onAuthChange} from './authentication'

import Observable from 'zen-observable'
import SendObservable from '../../util/SendObservable'
import ReconnectingWebSocket from 'reconnecting-websocket'
import {CellOrUndefined, createMergeableStore, MapCell, Store} from 'tinybase'
import {createLocalPersister} from 'tinybase/persisters/persister-browser'
import {createWsSynchronizer, WsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client'
import {mapObjIndexed, mergeDeepRight} from 'ramda'
import CollectionConfig, {parseCollections} from '../../shared/CollectionConfig'
import {addIdToItem, convertFromDbData, convertToDbData} from '../../shared/convertData'
import {mapValues} from 'radash'

const SERVER_SCHEME = 'ws://';

export type Properties = {collections: string, databaseTypeName: string, databaseInstanceName: string, persist?: boolean, sync?: boolean, syncServer?: string, debugSync?: boolean}

type NullableSynchronizer = WsSynchronizer<WebSocket> | null

const defaultSyncServer = globalThis.location?.host + '/do/'

const createStore = async (doNamespace: string, pathId: string, persist: boolean, sync: boolean, syncServer: string, debug: boolean): Promise<[Store, NullableSynchronizer]> => {
    const store = createMergeableStore()
    if (persist) {
        const persister = createLocalPersister(store, 'local://' + syncServer + doNamespace + '/' + pathId)
        await persister.startAutoPersisting();
    }

    let synchronizer: NullableSynchronizer = null
    if (sync) {
        // Auth token passed in protocol header - see discussion at https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
        const authToken = await getIdToken() ?? NullToken
        const wsUrl = SERVER_SCHEME + syncServer + doNamespace + '/' + pathId
        console.log('wsUrl', wsUrl)
        const protocols = [authToken, ...AuthStatusValues]
        const webSocket = new ReconnectingWebSocket(wsUrl, protocols) as unknown as WebSocket
        const receive = debug ? (fromClientId: any, requestId: any, message: any, body: any) => {
            console.log('Client receive', fromClientId, requestId, message)
            console.dir(body, {depth: 7})
        } : undefined
        const send = debug ? (toClientId: any, requestId: any, message: any, body: any) => {
            console.log('Client send', toClientId, requestId, message)
            console.dir(body, {depth: 7})
        } : undefined
        synchronizer = await createWsSynchronizer(
            store,
            webSocket,
            1,
            send,
            receive
        );
        await synchronizer.startSync()

        // If the websocket reconnects in the future, do another explicit sync.
        synchronizer.getWebSocket().addEventListener('open', () => {
            synchronizer?.load().then(() => synchronizer?.save());
        })
        synchronizer.getWebSocket().addEventListener('close', () => {
            // console.info('websocket closed', new Date())
        })
    }

    return [store, synchronizer]
}

export default class TinyBaseDataStoreImpl implements DataStore {
    private initialising: Promise<void> | null = null
    private closing: Promise<void> = Promise.resolve()
    private theDb: Store | null = null
    private synchronizer: NullableSynchronizer = null
    private removeChangeListeners: VoidFunction | null = null
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

    get isReadWrite() { return !this.synchronizer || this.synchronizer?.getWebSocket()?.protocol === 'readwrite' }

    async init(collectionName?: CollectionName) {
        if (collectionName) {
            this.checkCollectionName(collectionName)
        }

        await this.closing

        if (this.initialising === null) {
            this.initialising = this.initStore()
            await this.initialising
            this.authObserver = onAuthChange(async () => {
                console.log('auth change', 'current user', currentUser())
                this.notifyAll(InvalidateAll)
                this.closing = this.close()
                await this.closing
                this.initialising = this.initStore()
            })
        }
        await this.initialising

        return this
    }

    private async initStore() {
        const {databaseTypeName, databaseInstanceName, persist = false, sync = false, syncServer = defaultSyncServer, debugSync = false} = this.props;
        [this.theDb, this.synchronizer] = await createStore(databaseTypeName, databaseInstanceName, persist, sync, syncServer, debugSync)
        this.removeChangeListeners = this.listenForChanges(this.theDb)
    }

    async close() {
        this.removeChangeListeners?.()
        await this.synchronizer?.stopSync()
        this.synchronizer?.getWebSocket().close()
    }

    private checkCollectionName(collectionName: CollectionName) {
        if (!this.collections.some(coll => coll.name === collectionName)) {
            throw new Error(`Collection '${collectionName}' not found`)
        }
    }

    private listenForChanges(store: Store) {
        type Change = [collectionName: string, changeType: UpdateType, id: Id, changes?: DataStoreObject]
        let changes: Change[] = []
        const listenerId1 = store.addCellListener(null, null, 'json_data', (_store, tableId, rowId, _cellId, newCell, oldCell, _getCellChange) => {
            const changeType = oldCell === undefined ? Add : newCell === undefined ? Remove : Update
            const change = (): Change => {
                switch (changeType) {
                    case Add:
                        return [tableId, Add, rowId, convertFromDbData(JSON.parse(newCell.toString()))]
                    case Update:
                        return [tableId, Update, rowId, convertFromDbData(JSON.parse(newCell.toString()))]
                    case Remove:
                        return [tableId, Remove, rowId]
                }
            }
            changes.push(change())
        })

        const listenerId2 = store.addDidFinishTransactionListener(() => {
            if (changes.length === 1) {
                this.notify.apply(this, changes[0] as any)
            } else {
                const updatedCollections = new Set(changes.map(([tableId]) => tableId))
                updatedCollections.forEach((coll: string) => this.notify(coll, MultipleChanges))
            }
            changes = []
        })

        return () => {
            store.delListener(listenerId1)
            store.delListener(listenerId2)
        }
    }

    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    private checkIsReadWrite() {
        if (!this.isReadWrite) {
            throw new Error('Read only access')
        }
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
        this.checkIsReadWrite()
        const dbItem = convertToDbData(addIdToItem(item, id))
        this.db.setCell(collectionName, id.toString(), 'json_data', JSON.stringify(dbItem))
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        await this.init(collectionName)
        this.checkIsReadWrite()
        const toDbItem = (item: DataStoreObject, id: Id) => convertToDbData(addIdToItem(item, id))
        const dbItems = Object.values(mapObjIndexed( toDbItem, items))
        this.db.transaction(() => {
            Object.values(dbItems).forEach(item => {
                this.db.setCell(collectionName, item.id, 'json_data', JSON.stringify(item))
            })
        })
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        await this.init(collectionName)
        this.checkIsReadWrite()

        const updateCell: MapCell = (cell: CellOrUndefined) => {
            if (cell === undefined) {
                throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
            }
            const existingItem = convertFromDbData(JSON.parse(cell as string))
            const updatedItem = mergeDeepRight(existingItem, changes)
            return JSON.stringify(convertToDbData(updatedItem))
        }
        this.db.setCell(collectionName, id.toString(), 'json_data', updateCell)
    }

    async remove(collectionName: CollectionName, id: Id) {
        await this.init(collectionName)
        this.checkIsReadWrite()
        this.db.delRow(collectionName, id.toString())
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        await this.init(collectionName)
        const collection = mapValues(this.db.getTable(collectionName), row => convertFromDbData(JSON.parse(row.json_data as string)))
        return Object.values(collection).filter( queryMatcher(criteria))
    }

    observable(collection: CollectionName): Observable<UpdateNotification> {
        this.checkCollectionName(collection)
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
}
