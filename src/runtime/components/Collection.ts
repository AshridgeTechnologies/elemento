import {createElement} from 'react'
import {idOf, valueLiteral} from '../runtimeFunctions'
import lodash from 'lodash';
import {equals, map, mapObjIndexed, mergeDeepRight, mergeRight, omit} from 'ramda'
import DataStore, {
    Add,
    CollectionName,
    Criteria,
    Id,
    InvalidateAll,
    MultipleChanges,
    pending,
    queryMatcher,
    Remove,
    Update,
    UpdateNotification
} from '../../shared/DataStore'
import {AppStateForObject, BaseComponentState, ComponentState, WithChildStates} from './ComponentState'
import {onAuthChange} from './authentication'
import {toArray} from '../../util/helpers'
import {shallow} from 'zustand/shallow'
import {useObject} from '../appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

const {clone, isArray, isNumber, isObject, isString} = lodash;

type Properties = {path: string, display?: boolean}
type ExternalProperties = {value: object, dataStore?: DataStore, collectionName?: CollectionName}
type StateProperties = Partial<{value: object, queries: object, subscription: any, authSubscription: VoidFunction, subscribedDataStore: DataStore}>

let lastGeneratedId = 1

export const CollectionSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Collection",
    "description": "Description of Collection",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Collection",
    "icon": "auto_awesome_motion",
    "elementType": "statefulUI",
    "parentType": [
        "App",
        "Page"
    ],
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "initialValue": {
                    "description": "The ",
                    "$ref": "#/definitions/Expression"
                },
                "dataStore": {
                    "description": "The ",
                    "$ref": "#/definitions/Expression"
                },
                "collectionName": {
                    "description": "The ",
                    "$ref": "#/definitions/StringOrExpression",
                    "default": "=codeName"
                },
                "display": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression",
                    "default": false
                }
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}
export const CollectionMetadata: ElementMetadata = {
    stateProps: ['initialValue', 'dataStore', 'collectionName']
}

export default function Collection({path, display = false}: Properties) {
    const state = useObject<CollectionState>(path)
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(state.value))) : null
}


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

const initialValue = (value?: any): object => {
    if (isArray(value)) {
        return Object.fromEntries( value.map(toEntry))
    }

    if (isObject(value)) {
        return clone(value)
    }

    return {}
}

type AddItem = object | string | number

export class CollectionState extends BaseComponentState<ExternalProperties, StateProperties>
    implements ComponentState<CollectionState>{

    constructor({value, collectionName, dataStore}: { value?: any, dataStore?: DataStore, collectionName?: CollectionName }) {
        super({value: initialValue(value), collectionName, dataStore})
    }

    private updateValue(id: Id, data: any) {
        const newValue = mergeRight(this.value, {[id]: data})
        this.state.value = newValue
        this.updateState({value: newValue})
    }

    private updateQueries(key: string, data: any) {
        const newQueries = mergeRight(this.queries, {[key]: data})
        this.state.queries = newQueries
        this.updateState({queries: newQueries})
    }

    _withStateChanges(changes: StateProperties): CollectionState {
        const newVersion = new CollectionState(this.props)
        newVersion.state = Object.assign({}, this.state, changes) as WithChildStates<StateProperties>
        newVersion._appStateInterface = this._appStateInterface
        newVersion._path = this._path
        return newVersion
    }

    init(asi: AppStateForObject, path: string): void {
        super.init(asi, path)
        const {dataStore, collectionName} = this.props
        const {subscription, authSubscription, subscribedDataStore} = this.state

        if (dataStore && collectionName && dataStore !== subscribedDataStore) {
            subscription?.unsubscribe()
            this.state.subscription = dataStore.observable(collectionName).subscribe((update: UpdateNotification) => {
                try {
                    this.onDataUpdate(update)
                } catch (e) {
                    console.error('Error updating collection', e)
                }
            })
            this.state.subscribedDataStore = dataStore
        }

        if (!authSubscription) {
            this.state.authSubscription = onAuthChange(() => this.latest().updateState({value: {}, queries: {}}))
        }
    }

    protected isEqualTo(newObj: this) {
        const thisSimpleProps = omit(['value'], this.props)
        const newSimpleProps = omit(['value'], newObj.props)
        const simplePropsMatch = shallow(thisSimpleProps, newSimpleProps)
        return simplePropsMatch && equals(this.props.value, newObj.props.value)
    }

    get value() { return this.state.value !== undefined ? this.state.value : this.props.value }
    get dataStore() { return this.props.dataStore }
    private get queries() { return this.state.queries ?? {} }

    valueOf() { return Object.values(this.value) }

    Update(id: Id, changes: object) {
        const safeChanges = omit(['id'], changes)
        const storedItem = this.storedValue(id)
        if(storedItem) {
            const newItem = mergeRight(storedItem, safeChanges)
            this.updateValue(id, newItem)
        }

        if (this.dataStore) {
            return this.dataStore.update(this.props.collectionName!, id, safeChanges)
        }
    }

    Add(item: AddItem | AddItem[]) {
        if (Array.isArray(item)) {
            const items = toArray(item)
            const addItems = {} as {[id: Id]: any}
            items.forEach( item => {
                const [key, value] = toEntry(item)
                const id = key.toString()
                addItems[id] = value
            })

            const newValue = mergeRight(this.value, addItems)
            this.updateState({value: newValue})

            if (this.dataStore) {
                return this.dataStore.addAll(this.props.collectionName!, addItems).then( ()=> addItems )
            }
        } else {
            const [id, itemWithId] = toEntry(item)
            this.updateValue(id as Id, itemWithId)

            if (this.dataStore) {
                return this.dataStore.add(this.props.collectionName!, id as Id, itemWithId as object).then( ()=> itemWithId )
            } else {
                return itemWithId
            }
        }
    }

    Remove(id: Id){
        if(this.storedValue(id)) {
            const newValue = omit([id.toString()], this.value)
            this.updateState({value: newValue})
        }


        if (this.dataStore) {
            return this.dataStore.remove(this.props.collectionName!, id)
        }
    }

    Get(id: Id, nullIfNotFound = false) {
        const storedValue = this.storedValue(id)
        if (storedValue !== undefined) {
            return storedValue
        }

        if (this.dataStore) {
            const result = pending(this.dataStore.getById(this.props.collectionName!, id, nullIfNotFound).then( data => {
                this.latest().updateValue(id, data)
                return data
            }))

            this.updateValue(id, result)
            return result
        }

        return null
    }

    Query(criteria: Criteria) {
        if (this.dataStore) {

            const criteriaKey = JSON.stringify(criteria)
            const storedResult = this.queries[criteriaKey as keyof object]
            if (storedResult) {
                return storedResult
            }

            const result = pending(this.dataStore.query(this.props.collectionName!, criteria).then(data => {
                this.latest().updateQueries(criteriaKey, data)
                return data
            }))
            this.updateQueries(criteriaKey, result)

            return result
        }

        return null

    }

    GetAll() {
        return Object.values(this.value)
    }

    Reset() {
        this.updateState({value: undefined})
    }

    private storedValue(id: Id) {
        return this.value[id as keyof object]
    }

    private onDataUpdate(update: UpdateNotification) {
        if (update.type === InvalidateAll) {
            this.latest().updateState({value: {}, queries: {}})
        }
        if (update.type === MultipleChanges) {
            this.latest().updateState({queries: {}})
        }

        if (update.type === Add) {
            const {changes: newItem = {}} = update
            const {queries} = this.latest()

            const addToQueryResults = (results: object[], queryKey: string) => {
                const criteria = JSON.parse(queryKey) as Criteria
                const shouldBeInResults = queryMatcher(criteria)(newItem)
                if (shouldBeInResults){
                    return results.concat(newItem!)
                }

                return results
            }

            const existingQueries = queries as {[key:string] : object[]}
            // @ts-ignore
            const adjustedQueries = mapObjIndexed(addToQueryResults, existingQueries)
            this.latest().updateState({queries: adjustedQueries})
        }

        if (update.type === Update) {
            const {id, changes} = update
            const {value, queries} = this.latest()
            const isTheUpdatedObj = (obj: any) => idOf(obj) === id
            const updatedValue = (id! in value) ? mergeDeepRight(value, {[id as string]: changes}) : value
            const updateQueryResults = (results: object[]) => {
                if (results.find(isTheUpdatedObj)) {
                    return results.map( r => isTheUpdatedObj(r) ? mergeRight(r, changes!) : r)
                } else {
                    return results
                }
            }

            const addOrRemoveFromQueryResults = (results: object[], queryKey: string) => {
                const isInResults = results.find(isTheUpdatedObj)
                const criteria = JSON.parse(queryKey) as Criteria
                const updatedItem = updatedValue[id as keyof object]
                const shouldBeInResults = queryMatcher(criteria)(updatedItem)
                if (isInResults && !shouldBeInResults) {
                    return results.filter( r => !isTheUpdatedObj(r) )
                }

                if (!isInResults && shouldBeInResults){
                    return results.concat(updatedItem)
                }

                return results
            }

            const existingQueries = queries as {[key:string] : object[]}
            // @ts-ignore
            const updatedQueries = mapObjIndexed(updateQueryResults, existingQueries)
            const adjustedQueries = (id! in updatedValue) ? mapObjIndexed(addOrRemoveFromQueryResults, updatedQueries) : updatedQueries
            this.latest().updateState({value: updatedValue, queries: adjustedQueries})
        }

        if (update.type === Remove) {
            const {id} = update
            const {value, queries} = this.latest()
            const isTheDeletedObj = (obj: any) => idOf(obj) === id
            const updatedValue = (id! in value) ? omit([id as string], value) : value
            const updateQueryResults = (results: object[]) => {
                if (results.find(isTheDeletedObj)) {
                    return results.filter( r => !isTheDeletedObj(r) )
                } else {
                    return results
                }
            }

            const existingQueries = queries as {[key:string] : object[]}
            // @ts-ignore
            const updatedQueries = map(updateQueryResults, existingQueries)
            this.latest().updateState({value: updatedValue, queries: updatedQueries})
        }
    }
}

Collection.State = CollectionState
Collection.Schema = CollectionSchema
Collection.Metadata = CollectionMetadata
