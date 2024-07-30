import DataStore, {CollectionName, Criteria, DataStoreObject, Id, UpdateNotification} from '../DataStore'
import Observable from 'zen-observable'
import MemoryDataStore from './MemoryDataStore'
import {mapValues} from 'radash'
import {isoDateReviver} from '../../util/helpers'

const EMPTY_OBSERVABLE = Observable.from([])

export default class WebFileDataStoreImpl implements DataStore {
    private inMemoryStore: MemoryDataStore | null = null
    constructor(private props: {url: string, fetch?: typeof globalThis.fetch}) {}

    private get fetch() {
        return this.props.fetch ?? globalThis.fetch
    }
    add(collection: CollectionName, id: Id, item: DataStoreObject): Promise<void> {
        return Promise.resolve(undefined)
    }

    addAll(collection: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        return Promise.resolve(undefined)
    }

    async getById(collection: CollectionName, id: Id): Promise<DataStoreObject | null> {
        if (this.inMemoryStore === null) {
            const response = await this.fetch(this.props.url)
            const jsonText = await response.text()
            const data = JSON.parse(jsonText, isoDateReviver)
            const dataForMemoryStore = mapValues(data, (items: any[]) => Object.fromEntries( items.map( item => [item.id, item])))
            this.inMemoryStore = new MemoryDataStore(dataForMemoryStore)
        }

        return this.inMemoryStore.getById(collection, id)
    }

    observable(collection: CollectionName): Observable<UpdateNotification> {
        return EMPTY_OBSERVABLE
    }

    async query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        if (this.inMemoryStore === null) {
            const response = await this.fetch(this.props.url)
            const data = await response.json()
            const dataForMemoryStore = mapValues(data, (items: any[]) => Object.fromEntries( items.map( item => [item.id, item])))
            this.inMemoryStore = new MemoryDataStore(dataForMemoryStore)
        }

        return this.inMemoryStore.query(collection, criteria)
    }

    remove(collection: CollectionName, id: Id): Promise<void> {
        return Promise.resolve(undefined)
    }

    update(collection: CollectionName, id: Id, changes: object): Promise<void> {
        return Promise.resolve(undefined)
    }

}
