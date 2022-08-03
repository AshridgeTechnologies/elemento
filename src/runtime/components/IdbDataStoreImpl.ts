import DataStore, {
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    InvalidateAllQueries,
    UpdateNotification
} from '../DataStore'
import Observable from 'zen-observable'
import SendObservable from '../SendObservable'
import {mapObjIndexed} from 'ramda'
import Dexie, {Table} from 'dexie'
import {matches} from 'lodash'

type Properties = {databaseName: string, collectionNames: string[]}
export default class IdbDataStoreImpl implements DataStore {
    private db: Dexie
    constructor(private props: Properties) {
        this.db = new Dexie(props.databaseName)
        const collectionDefs = Object.fromEntries(props.collectionNames.map(name => [name, 'id']))

        this.db.version(1).stores(collectionDefs)
    }

    // private inMemoryStore: MemoryDataStore = new MemoryDataStore()
    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    private table(collection: CollectionName) {
        return this.db[collection as keyof Dexie] as unknown as Table
    }

    async getById(collection: CollectionName, id: Id) {
        if (!this.props.collectionNames.includes(collection)) {
            throw new Error(`Collection '${collection}' not found`)
        }

        const item = await this.table(collection).get(id)
        if (!item) {
            throw new Error(`Object with id '${id}' not found in collection '${collection}'`)
        }

        return item
    }

    async add(collection: CollectionName, id: Id, item: DataStoreObject) {
        const itemWithId = {...item, id}
        await this.table(collection).put(itemWithId)
        this.invalidateCollectionQueries(collection)
    }

    async addAll(collection: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const addIdToItem = (item: DataStoreObject, id: Id) => ({...item, id})
        const itemsWithIds = Object.values(mapObjIndexed( addIdToItem, items))
        await this.table(collection).bulkAdd(itemsWithIds)
        this.invalidateCollectionQueries(collection)
    }

    async update(collection: CollectionName, id: Id, changes: object) {
        await this.table(collection).update(id, changes)
        this.invalidateCollectionQueries(collection)
    }

    async remove(collection: CollectionName, id: Id) {
        await this.table(collection).delete(id)
        this.invalidateCollectionQueries(collection)
    }

    async query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        return this.table(collection).filter( matches(criteria)).toArray()
    }

    observable(collection: CollectionName): Observable<UpdateNotification> {
        let observable = this.collectionObservables.get(collection)
        if (!observable) {
            observable = new SendObservable()
            this.collectionObservables.set(collection, observable)
        }
        return observable
    }

    // Dexie has liveQuery(), but it doesn't appear to offer more than this basic method
    // It would still end up re-running the query every time something changed in the db
    private invalidateCollectionQueries(collection: CollectionName) {
        let observable = this.collectionObservables.get(collection)
        if (observable) {
            observable.send({collection, type: InvalidateAllQueries})
        }
    }
}
