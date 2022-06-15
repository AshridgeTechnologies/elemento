import {createElement} from 'react'
import {_DELETE, valueLiteral} from '../runtimeFunctions'
import {clone, isArray, isNumber, isObject, isPlainObject, isString} from 'lodash'
import {mergeRight, omit} from 'ramda'
import {ResultWithUpdates, update, Update} from '../stateProxy'
import DataStore, {CollectionName, Criteria, Id, InvalidateAll, InvalidateAllQueries, Pending} from '../DataStore'

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
    private props: {  dataStore?: DataStore, collectionName?: CollectionName }
    private immediatePendingGets = new Set()
    private state: {value: object , queries: object, subscription?: any, updateFn: (changes: object, replace?: boolean)=> void}

    constructor({value, collectionName, dataStore }: { value?: any, dataStore?: DataStore, collectionName?: CollectionName }) {
        this.props = {
            dataStore,
            collectionName,
        }

        this.state = {
            value: initialValue(value),
            queries: {},
            updateFn: () => { throw new Error('updateFn called before injected')}
        }
    }

    setState(changes: { value?: object, queries?: object}) {
        const result = new Collection.State(this.props)
        result.state = mergeRight(this.state, changes)
        return result
    }

    private updateState(changes: { value?: object, queries?: object }) {
        this.state.updateFn(this.setState(changes), true)
    }

    private updateValue(id: Id, data: any) {
        const newValue = mergeRight(this.value, {[id]: data})
        this.updateState({value: newValue})
    }

    mergeProps(newState: typeof this) {
        return this  // not expected to change collection name or data store at runtime AND comparing proxies for DataStore does not work
    }

    init(updateFn: (changes: object, replace?: boolean)=> void) {
        const {dataStore, collectionName} = this.props
        const {subscription} = this.state
        this.state.updateFn = updateFn  // no effect on external view so no need to update

        if (dataStore && collectionName && !subscription) {
            this.state.subscription = dataStore.observable(collectionName).subscribe((update) => {
                if (update.type === InvalidateAll) {
                    this.updateState({value: {}, queries: {}})
                }
                if (update.type === InvalidateAllQueries) {
                    this.updateState({queries: {}})
                }
            })
        }
    }

    get value() { return this.state.value }
    get dataStore() { return this.props.dataStore }

    Update(id: Id, changes: object) {
        const safeChanges = omit(['id', 'Id'], changes)
        if(this.storedValue(id)) {
            this.updateValue(id, safeChanges)
        }

        if (this.dataStore) {
            this.dataStore.update(this.props.collectionName!, id, safeChanges)
        }
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
            return new Pending()
        }
        if (this.dataStore) {
            const result = new Pending()
            this.updateValue(id, result)

            this.dataStore.getById(this.props.collectionName!, id).then( data => {
                this.updateValue(id, data)
            })
            this.immediatePendingGets.add(id)
            return result
        }

        return null
    }

    Query(criteria: Criteria) {
        if (this.dataStore) {

            const criteriaKey = valueLiteral(criteria)
            const storedResult = this.state.queries[criteriaKey as keyof object]
            if (storedResult) {
                return storedResult
            }

            if (this.immediatePendingGets.has(criteriaKey)) {
                return new Pending()
            }
            const result = new Pending()
            // const syncUpdate = update({queries: {[criteriaKey]: result}})
            this.updateState({queries: {[criteriaKey]: result}})
            this.dataStore.query(this.props.collectionName!, criteria).then(data => {
                // return update({queries: {[criteriaKey]: data}})
                this.updateState({queries: {[criteriaKey]: data}})
            })
            this.immediatePendingGets.add(criteriaKey)
            return result
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
