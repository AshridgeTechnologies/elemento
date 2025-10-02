import {createElement} from 'react'
import {idOf, valueLiteral} from '../runtimeFunctions'
import lodash, {result} from 'lodash';
import {equals, map, mapObjIndexed, mergeDeepRight, mergeRight, omit, props} from 'ramda'
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
import {BaseComponentState} from '../state/BaseComponentState'
import {onAuthChange} from './authentication'
import {toArray} from '../../util/helpers'
import {useComponentState} from '../state/appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'


const {clone, isArray, isNumber, isObject, isString} = lodash;

type Properties = {path: string, display?: boolean} & ExternalProperties
type ExternalProperties = {initialValue?: any, dataStore?: DataStore, collectionName?: CollectionName, normalisedInitialValue?: object}
type StateProperties = Partial<{value: object, queries: object, subscription: any, authSubscription: VoidFunction}>

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

export default function Collection({path, initialValue, dataStore, collectionName, display = false}: Properties) {
    const state = useComponentState(path, CollectionState, {initialValue, dataStore, collectionName})
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

const getInitialValue = (value?: any): object => {
    if (isArray(value)) {
        return Object.fromEntries( value.map(toEntry))
    }

    if (isObject(value)) {
        return clone(value)
    }

    return {}
}

type AddItem = object | string | number

export class CollectionState extends BaseComponentState<ExternalProperties, StateProperties> {

    constructor({initialValue, collectionName, dataStore}: ExternalProperties) {
        super({initialValue, collectionName, dataStore, normalisedInitialValue: getInitialValue(initialValue)})
    }

    private updateValue(id: Id, data: any) {
        const newValue = mergeRight(this.value, {[id]: data})
        this.updateState({value: newValue})
        // this.state.value = newValue
    }

    private updateQueries(key: string, data: any) {
        const newQueries = mergeRight(this.queries, {[key]: data})
        this.updateState({queries: newQueries})
        // this.state.queries = newQueries
    }

    protected doInit(_previousVersion: this | undefined, _proxyThis: this): void {
        const {dataStore, collectionName} = this.props

        if (dataStore && collectionName && dataStore !== _previousVersion?.dataStore) {
            _previousVersion?.state.subscription?.unsubscribe()
            this.state.subscription = dataStore.observable(collectionName).subscribe((update: UpdateNotification) => {
                try {
                    _proxyThis.onDataUpdate(update)
                } catch (e) {
                    console.error('Error updating collection', e)
                }
            })
        }

        if (!_previousVersion) {
            this.state.authSubscription = onAuthChange(() => this.updateState({value: {}, queries: {}}))
        }
    }


    protected propsEqual(props: ExternalProperties): boolean {
        return equals(omit(['normalisedInitialValue'], this.props), props)
    }

    get value() { return this.state.value !== undefined ? this.state.value : this.props.normalisedInitialValue! }
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
                this.updateValue(id, data)
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
                this.updateQueries(criteriaKey, data)
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
            this.updateState({value: {}, queries: {}})
        }
        if (update.type === MultipleChanges) {
            this.updateState({queries: {}})
        }

        if (update.type === Add) {
            const {changes: newItem = {}} = update
            const {queries} = this

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
            this.updateState({queries: adjustedQueries})
        }

        if (update.type === Update) {
            const {id, changes} = update
            const {value, queries} = this
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
            this.updateState({value: updatedValue, queries: adjustedQueries})
        }

        if (update.type === Remove) {
            const {id} = update
            const {value, queries} = this
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
            this.updateState({value: updatedValue, queries: updatedQueries})
        }
    }
}

Collection.State = CollectionState
Collection.Schema = CollectionSchema
Collection.Metadata = CollectionMetadata
