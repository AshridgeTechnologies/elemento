import DataStore, {CollectionName, Criteria, DataStoreObject, Id, UpdateNotification} from '../DataStore'
import Observable from 'zen-observable'
import MemoryDataStore from './MemoryDataStore'
import {mapValues} from 'radash'
import {isoDateReviver} from '../../util/helpers'
import {globalFetch} from './ComponentHelpers'

const EMPTY_OBSERVABLE = Observable.from([])

function readonlyError() {
    return Promise.reject(new Error('Cannot change readonly datastore'))
}

export default class WebFileDataStoreImpl implements DataStore {
    private inMemoryStore: MemoryDataStore | null = null
    constructor(private props: {url: string, fetch?: typeof globalThis.fetch}) {}

    private async store(): Promise<MemoryDataStore> {
        if (this.inMemoryStore === null) {
            const fetch = this.props.fetch ?? globalFetch
            const response = await fetch(this.props.url)
            const contentType = response.headers.get('Content-Type')
            const isJson = contentType?.startsWith('application/json')
            if (!response.ok) {
                const jsonError = isJson ? (await response.json()).error?.message ?? '' : ''
                throw new Error(`Error getting data: ${response.status} ${jsonError}`)
            }
            if (!isJson) {
                throw new Error(`Error getting data: Content-Type is not JSON - ${contentType}`)
            }
            const jsonText = await response.text()
            const data = JSON.parse(jsonText, isoDateReviver)
            const dataForMemoryStore = mapValues(data, (items: any[]) => Object.fromEntries( items.map( (item, index) => [item.id ?? String(index) , item])))
            this.inMemoryStore = new MemoryDataStore(dataForMemoryStore)
        }

        return this.inMemoryStore
    }

    add(collection: CollectionName, id: Id, item: DataStoreObject): Promise<void> {
        return readonlyError()
    }

    addAll(collection: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        return readonlyError()
    }

    async getById(collection: CollectionName, id: Id, nullIfNotFound = false): Promise<DataStoreObject | null> {
        return (await this.store()).getById(collection, id, nullIfNotFound)
    }

    observable(collection: CollectionName): Observable<UpdateNotification> {
        return EMPTY_OBSERVABLE
    }

    async query(collection: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        return (await this.store()).query(collection, criteria)
    }

    remove(collection: CollectionName, id: Id): Promise<void> {
        return readonlyError()
    }

    update(collection: CollectionName, id: Id, changes: object): Promise<void> {
        return readonlyError()
    }

}
