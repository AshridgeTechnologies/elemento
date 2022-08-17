import DataStore, {CollectionName, Criteria, DataStoreObject, Id, queryMatcher, UpdateNotification} from '../DataStore'
import {clone} from 'lodash'
import {mergeDeepRight} from 'ramda'
import Observable from 'zen-observable'

const emptyObservable = new Observable<UpdateNotification>(() => {})

export default class MemoryDataStore implements DataStore {
    private data: object
    constructor(initialData: object = {}) {
        this.data = clone(initialData)
    }

    async getById(collectionName: CollectionName, id: Id): Promise<DataStoreObject> {
        const resultObject = (this.getCollection(collectionName, true))[id as keyof object]
        if (!resultObject) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }

        return resultObject
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<DataStoreObject[]> {
        const collection = this.getCollection(collectionName, true)
        return Object.values(collection).filter( queryMatcher(criteria))
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject): Promise<void> {
        const collection = this.getCollection(collectionName, true)
        if (id in collection) {
            throw new Error(`Object with id '${id}' already exists in collection '${collectionName}'`)
        }
        (collection[id as keyof object] as any) = item
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const collection = this.getCollection(collectionName, true)
        Object.keys(items).forEach( id => {
            if (id in collection) {
                throw new Error(`Object with id '${id}' already exists in collection '${collectionName}'`)
            }
        })

        Object.assign(collection, items)
    }

    async update(collectionName: CollectionName, id: Id, changes: object): Promise<void> {
        const collection = this.getCollection(collectionName)
        const existingObject = (collection)[id as keyof object];
        if (!existingObject) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }
        (collection[id as keyof object] as any) = mergeDeepRight(existingObject, changes)
    }

    async remove(collectionName: CollectionName, id: Id): Promise<void> {
        const collection = this.getCollection(collectionName)
        if (!(id in collection)) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }
        delete collection[id as keyof object] as any
    }

    async getAllData(): Promise<object> {
        return Promise.resolve(this.data)
    }

    observable(collection: CollectionName) {
        return emptyObservable
    }

    private getCollection(collectionName: CollectionName, create: boolean = false) {
        let collection = this.data[collectionName as keyof object] as object
        if (!collection) {
            if (create) {
                collection = (this.data[collectionName as keyof object] as any) = {}
            } else {
                throw new Error(`Collection '${collectionName}' not found`)
            }
        }

        return collection
    }
}