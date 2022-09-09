import {isNumber, isString} from 'lodash'
import {omit} from 'ramda'
import {BasicDataStore, CollectionName, Criteria, Id} from '../runtime/DataStore'
import {toArray} from '../util/helpers'


let lastGeneratedId = 1

export const toEntry = (value: any): [PropertyKey, any] => {
    if (isString(value) || isNumber(value)) {
        return [value, value]
    }

    const id = value.id
    if (id) {
        return [id, value]
    }

    const nextId = Math.max(lastGeneratedId+1, Date.now())
    const generatedId = nextId.toString()
    const valueWithId = {...value, id: generatedId}
    lastGeneratedId = nextId
    return [generatedId, valueWithId]
}
type AddItem = object | string | number

export default class Collection {
    private collectionName: CollectionName
    private dataStore: BasicDataStore

    constructor({collectionName, dataStore}: { dataStore: BasicDataStore, collectionName: CollectionName }) {
        this.collectionName = collectionName
        this.dataStore = dataStore
    }

    async Update(id: Id, changes: object) {
        const safeChanges = omit(['id'], changes)
        await this.dataStore.update(this.collectionName!, id, safeChanges)
    }

    async Add(item: AddItem | AddItem[]) {
        if (Array.isArray(item)) {
            const items = toArray(item)
            const addItems = {} as {[id: Id]: any}
            items.forEach( (item: AddItem) => {
                const [key, value] = toEntry(item)
                const id = key.toString()
                addItems[id] = value
            })

            await this.dataStore.addAll(this.collectionName!, addItems)
        } else {
            const [id, itemWithId] = toEntry(item)
            await this.dataStore.add(this.collectionName!, id as Id, itemWithId as object)
        }
    }

    async Remove(id: Id){
        await this.dataStore.remove(this.collectionName!, id)
    }

    async Get(id: Id) {
        return this.dataStore.getById(this.collectionName, id)
    }

    async Query(criteria: Criteria) {
        return this.dataStore.query(this.collectionName!, criteria)
    }
}

