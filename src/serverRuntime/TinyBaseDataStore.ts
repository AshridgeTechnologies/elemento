import {BasicDataStore, CollectionName, Criteria, DataStoreObject, Id, queryMatcher} from '../shared/DataStore'
import {DurableObjectNamespace, DurableObjectStub} from "@cloudflare/workers-types/experimental"
import CollectionConfig, {parseCollections} from '../shared/CollectionConfig'
import {addIdToItem, convertFromDbData, convertToDbData} from '../shared/convertData'
import {TinyBaseDurableObject} from './TinyBaseDurableObject'
import {mergeDeepRight} from 'ramda'

type Properties = {collections: string, durableObject: DurableObjectNamespace, databaseName: string}

export default class TinyBaseDataStore implements BasicDataStore {
    private readonly collections: CollectionConfig[]
    private readonly durableObjectStub: DurableObjectStub<TinyBaseDurableObject>

    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
        const id = props.durableObject.idFromName(props.databaseName);
        this.durableObjectStub = props.durableObject.get(id) as DurableObjectStub<TinyBaseDurableObject>
    }

    private checkCollection(collectionName: string) {
        if (!this.collections.some( coll => coll.name === collectionName)) {
            throw new Error(`Collection '${collectionName}' not found`)
        }
    }
    async getById(collectionName: CollectionName, id: Id, nullIfNotFound = false) {
        this.checkCollection(collectionName)
        const data: string | null = await this.durableObjectStub.getJsonData(collectionName, id)

        if (!data) {
            if (nullIfNotFound) {
                return null
            } else {
                throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
            }
        }
        return convertFromDbData(JSON.parse(data))
    }
    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        this.checkCollection(collectionName)
        const dbItem = convertToDbData(addIdToItem(item, id))
        await this.durableObjectStub.setJsonData(collectionName, id, JSON.stringify(dbItem))
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const addPromises = Object.entries(items).map(([id, item]) => this.add(collectionName, id, item))
        await Promise.all(addPromises)
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        this.checkCollection(collectionName)
        const existingItem = await this.getById(collectionName, id) as object
        const updatedItem = mergeDeepRight(existingItem, changes)
        const dbItem = convertToDbData(updatedItem)
        await this.durableObjectStub.setJsonData(collectionName, id, JSON.stringify(dbItem))
    }

    async remove(collectionName: CollectionName, id: Id) {
        this.checkCollection(collectionName)
        await this.durableObjectStub.removeJsonData(collectionName, id)
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        this.checkCollection(collectionName)
        const collectionJson = await this.durableObjectStub.getAllJsonData(collectionName)
        const collection = collectionJson.map(data => convertFromDbData(JSON.parse(data)))
        return Object.values(collection).filter( queryMatcher(criteria))
    }

    async test_clear(collectionName: CollectionName) {
        await this.durableObjectStub.test_clear(collectionName)
    }
}
