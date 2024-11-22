import DataStore, {
    Add,
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    MultipleChanges,
    Remove,
    Update,
    UpdateNotification,
    UpdateType
} from '../DataStore'
import Observable from 'zen-observable'
import SendObservable from '../../util/SendObservable'
import {mapObjIndexed} from 'ramda'
import Dexie, {Table} from 'dexie'
import lodash from 'lodash'; const {matches} = lodash
import BigNumber from 'bignumber.js'

const DECIMAL_PREFIX = '#Dec'
const convertFromDbValue = (value: any) => typeof value === 'string' && value.startsWith(DECIMAL_PREFIX) ? new BigNumber(value.substring(DECIMAL_PREFIX.length)) : value
const convertFromDbData = (data: any) => mapObjIndexed(convertFromDbValue, data)
const convertToDbValue = (value: any) => value instanceof BigNumber ? DECIMAL_PREFIX + value : value
const convertToDbData = (data: any) => mapObjIndexed(convertToDbValue, data)
const addIdToItem = (item: DataStoreObject, id: Id) => ({...item, id})

type Properties = {databaseName: string, collectionNames: string[]}
export default class IdbDataStoreImpl implements DataStore {
    private db: Dexie
    constructor(private props: Properties) {
        this.db = new Dexie(props.databaseName)
        const collectionDefs = Object.fromEntries(props.collectionNames.map(name => [name, 'id']))

        this.db.version(1).stores(collectionDefs)
    }

    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    private table(collection: CollectionName) {
        return this.db[collection as keyof Dexie] as unknown as Table
    }

    async getById(collection: CollectionName, id: Id, nullIfNotFound = false) {
        if (!this.props.collectionNames.includes(collection)) {
            throw new Error(`Collection '${collection}' not found`)
        }

        const item = await this.table(collection).get(id)
        if (!item) {
            if (nullIfNotFound) {
                return null
            }
            throw new Error(`Object with id '${id}' not found in collection '${collection}'`)
        }

        return convertFromDbData(item)
    }

    async add(collection: CollectionName, id: Id, item: DataStoreObject) {
        const itemWithId = addIdToItem(convertToDbData(item), id)
        await this.table(collection).put(itemWithId)
        this.notify(collection, Add, id, item)
    }

    async addAll(collection: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const itemsWithIds = Object.values(mapObjIndexed( addIdToItem, items)).map(convertToDbData)
        await this.table(collection).bulkAdd(itemsWithIds)
        this.notify(collection, MultipleChanges)
    }

    async update(collection: CollectionName, id: Id, changes: object) {
        await this.table(collection).update(id, convertToDbData(changes))
        this.notify(collection, Update, id, changes)
    }

    async remove(collection: CollectionName, id: Id) {
        await this.table(collection).delete(id)
        this.notify(collection, Remove, id)
    }

    async query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        const results = await this.table(collection).filter( matches(criteria)).toArray()
        return results.map( convertFromDbData )
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
    private notify(collection: CollectionName, type: UpdateType, id?: Id, changes?: DataStoreObject ) {
        const observable = this.collectionObservables.get(collection)
        observable?.send({collection, type, id, changes})
    }

}
