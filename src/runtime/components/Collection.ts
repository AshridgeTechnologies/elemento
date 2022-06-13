import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'
import {clone, isArray, isNumber, isObject, isString} from 'lodash'
import {equals, mergeRight, omit} from 'ramda'
import DataStore, {CollectionName, Criteria, Id, InvalidateAll, InvalidateAllQueries, Pending} from '../DataStore'
import {AppStateForObject, useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'
import shallow from 'zustand/shallow'

type Properties = {path: string, display?: boolean}
type ExternalProperties = {value: object, dataStore?: DataStore, collectionName?: CollectionName}
type StateProperties = {value?: object, queries?: object, subscription?: any}

let nextId = 1

export default function Collection({path, display = false}: Properties) {
    const state = useGetObjectState<CollectionState>(path)
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(state.value))) : null
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

export class CollectionState extends BaseComponentState<ExternalProperties, StateProperties>
    implements ComponentState<CollectionState>{
    private immediatePendingGets = new Set()

    constructor({value, collectionName, dataStore}: { value?: any, dataStore?: DataStore, collectionName?: CollectionName }) {
        super({value: initialValue(value), collectionName, dataStore})
    }

    private updateValue(id: Id, data: any) {
        const newValue = mergeRight(this.value, {[id]: data})
        this.updateState({value: newValue})
    }

    private updateQueries(key: string, data: any) {
        const newQueries = mergeRight(this.queries, {[key]: data})
        this.updateState({queries: newQueries})
    }

    private localUpdateQueries(key: string, data: any) {
        this.state.queries = mergeRight(this.queries, {[key]: data})
    }

    _withStateChanges(changes: StateProperties): CollectionState {
        const newVersion = new CollectionState(this.props)
        newVersion.state = Object.assign({}, this.state, changes) as StateProperties
        newVersion._appStateInterface = this._appStateInterface
        return newVersion
    }

    init(asi: AppStateForObject): void {
        super.init(asi)
        const {dataStore, collectionName} = this.props
        const {subscription} = this.state

        if (dataStore && collectionName && !subscription) {
            this.state.subscription = dataStore.observable(collectionName).subscribe((update) => {
                if (update.type === InvalidateAll) {
                    this.latest().updateState({value: {}, queries: {}})
                }
                if (update.type === InvalidateAllQueries) {
                    this.latest().updateState({queries: {}})
                }
            })
        }
    }

    updateFrom(newObj: CollectionState): this {
        const thisSimpleProps = omit(['value'], this.props)
        const newSimpleProps = omit(['value'], newObj.props)
        const simplePropsMatch = shallow(thisSimpleProps, newSimpleProps)
        const fullMatch = simplePropsMatch && equals(this.props.value, newObj.props.value)
        return fullMatch ? this : new CollectionState(newObj.props).withState(this.state) as this
    }

    get value() { return this.state.value !== undefined ? this.state.value : this.props.value }
    get dataStore() { return this.props.dataStore }
    private get queries() { return this.state.queries ?? {} }

    Update(id: Id, changes: object) {
        const safeChanges = omit(['id', 'Id'], changes)
        const storedItem = this.storedValue(id)
        if(storedItem) {
            const newItem = mergeRight(storedItem, safeChanges)
            this.updateValue(id, newItem)
        }

        if (this.dataStore) {
            this.dataStore.update(this.props.collectionName!, id, safeChanges)
        }
    }

    Add(item: object | string | number) {
        const [key, value] = toEntry(item)
        const id = key.toString()
        this.updateValue(id, item)

        if (this.dataStore) {
            this.dataStore.add(this.props.collectionName!, id, value)
        }
    }

    Remove(id: Id){
        if(this.storedValue(id)) {
            const newValue = omit([id.toString()], this.value)
            this.updateState({value: newValue})
        }


        if (this.dataStore) {
            this.dataStore.remove(this.props.collectionName!, id)
        }
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
                this.latest().updateValue(id, data)
            })
            this.immediatePendingGets.add(id)
            return result
        }

        return null
    }

    Query(criteria: Criteria) {
        if (this.dataStore) {

            const criteriaKey = valueLiteral(criteria)
            const storedResult = this.queries[criteriaKey as keyof object]
            if (storedResult) {
                return storedResult
            }

            if (this.immediatePendingGets.has(criteriaKey)) {
                return new Pending()
            }
            const result = new Pending()
            this.localUpdateQueries(criteriaKey, result)
            this.dataStore.query(this.props.collectionName!, criteria).then(data => {
                this.latest().updateQueries(criteriaKey, data)
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

Collection.State = CollectionState
