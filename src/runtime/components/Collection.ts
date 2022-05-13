import {createElement} from 'react'
import {_DELETE, valueLiteral} from '../runtimeFunctions'
import {clone, isArray, isNumber, isObject, isPlainObject, isString} from 'lodash'
import {omit} from 'ramda'
import {ResultWithUpdates, update, Update} from '../stateProxy'
import DataStore, {CollectionName, Id, InvalidateAll, Pending} from '../DataStore'

type Properties = {state: any, display?: boolean}

let nextId = 1

const Collection = function Collection({state, display = false}: Properties) {
    const {_path: path, value} = state
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(value))) : null
}


export const toEntry = (value: any): [PropertyKey, any] => {
    if (isString(value) || isNumber(value)) {
        return [value, value]
    }
    const id = value.id ?? value.Id ?? nextId++
    return [id, value]
}

const initialValue = (value?: any): object => {
    if (isArray(value)) {
        return Object.fromEntries( value.map(toEntry))
    }

    if (isObject(value)) {
        return clone(value)
    }

    return {}
}

Collection.State = class State {
    private props: { value: object, dataStore?: DataStore, collectionName?: CollectionName, subscription?: any }
    private immediatePendingGets = new Set()

    constructor({collectionName, dataStore, subscription, value}: { value?: any, dataStore?: DataStore, collectionName?: CollectionName, subscription?: any }) {
        this.props = {value: initialValue(value),
            dataStore,
            collectionName,
            subscription
        }
    }

    init(updateFn: (changes: object, replace?: boolean)=> void) {
        const {dataStore, collectionName, subscription} = this.props
        if (dataStore && collectionName && !subscription) {
            const newSubscription = dataStore.observable(collectionName).subscribe((update) => {
                if (update.type === InvalidateAll) {
                    updateFn({value: _DELETE})
                }
            })
            updateFn({subscription: newSubscription})
        }
    }

    get value() { return this.props.value }
    get dataStore() { return this.props.dataStore }

    Update(id: Id, changes: object): Update | ResultWithUpdates {
        const safeChanges = omit(['id', 'Id'], changes)
        const cacheUpdate = update({value: {[id]: safeChanges}})

        if (this.dataStore) {
            this.dataStore.update(this.props.collectionName!, id, safeChanges)
            const localUpdate = this.storedValue(id) && cacheUpdate
            return new ResultWithUpdates(undefined, localUpdate, undefined)
        }

        return cacheUpdate
    }

    Add(item: object | string | number): Update | ResultWithUpdates {
        const [key, value] = toEntry(item)
        const id = key.toString()
        const cacheUpdate = update({value: {[id]: value}})

        if (this.dataStore) {
            this.dataStore.add(this.props.collectionName!, id, value)
            return new ResultWithUpdates(undefined, cacheUpdate, undefined)
        }

        return cacheUpdate
    }

    Remove(id: Id): Update | ResultWithUpdates{
        const cacheUpdate = update({value: {[id]: _DELETE}})
        if (this.dataStore) {
            this.dataStore.remove(this.props.collectionName!, id)
            const localUpdate = this.storedValue(id) && cacheUpdate
            return new ResultWithUpdates(undefined, localUpdate, undefined)
        }

        return cacheUpdate
    }

    Get(id: Id) {
        const storedValue = this.storedValue(id)
        if (storedValue) {
            return storedValue
        }
        if (this.immediatePendingGets.has(id)) {
            return {_type: Pending}
        }
        if (this.dataStore) {
            const result = {_type: Pending}
            const syncUpdate = update({value: {[id]: result}})
            const asyncUpdate = this.dataStore.getById(this.props.collectionName!, id).then( data => {
                const _type = isObject(data) && !isPlainObject(data) ? data.constructor : _DELETE
                return update({value: {[id]: {_type, ...data}}})
            })
            this.immediatePendingGets.add(id)
            return new ResultWithUpdates(result, syncUpdate, asyncUpdate)
        }

        return null
    }

    private storedValue(id: Id) {
        return this.value[id as keyof object]
    }

    GetAll() {
        return Object.values(this.value)
    }

}

export default Collection
