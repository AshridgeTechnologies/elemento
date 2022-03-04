import create from 'zustand'
import {equals, lensPath, mergeDeepRight, mergeDeepWith, set, view} from 'ramda'
import {isObject, isPlainObject} from 'lodash'
import assert from 'assert'
import {valueLiteral} from './runtimeFunctions'


type baseStoreType = {app: {}}
const baseStore = ():baseStoreType => ({app: {}})

const isIntegerString = (s: string) => s.match(/^\d+$/)
const lensFor = (path: string) => {
    const props = path.split(/\.|\[|]\.?/).filter( s => s !== '' ).map( prop => isIntegerString(prop) ? Number(prop) : prop)
    return lensPath(props)
}
export const useStore = create( () => (baseStore()) )

export const setState = (path: string, state: any) => {
    const lens = lensFor(path)
    const existingState = useStore.getState()
    const existingStateAtPath = view(lens, existingState)
    const newStateAtPath = state

    if (!equals(newStateAtPath, existingStateAtPath)) {
        assert(newStateAtPath._update === undefined)
        const newState = set(lens, newStateAtPath, existingState)
        useStore.setState(newState)
    }
}

export const updateState = (path: string, changes: object) => {
    const lens = lensFor(path)
    const existingState = useStore.getState()
    const existingStateAtPath = view(lens, existingState)
    if (existingStateAtPath !== undefined && !isObject(existingStateAtPath)) {
        throw new Error(`${path}: cannot update existing value ${valueLiteral(existingStateAtPath)} with ${valueLiteral(changes)}`)
    }
    const newStateAtPath = mergeDeepRight(existingStateAtPath, changes)
    if (!equals(newStateAtPath, existingStateAtPath)) {
        const newState = set(lens, newStateAtPath, existingState)
        useStore.setState(newState)
    }
}

export const selectState = (path: string) => (state: object) => view(lensFor(path), state)

export const useObjectState = (path: string) => useStore(selectState(path))

export const _dangerouslyResetState = () => useStore.setState(baseStore(), true)

const useRightIfDefined = (left: any, right: any) => right !== undefined ? right : left

const stateProxyHandler = (path: string) => ({

    get(obj: any, prop: string): any {
        if (prop === '_path') {
            return path
        }

        if (prop === '_update') {
            return function(changes: object, replace: boolean = false) { replace ? setState(path, changes) : updateState(path, changes) }
        }

        if (prop === '_controlValue') {
            return obj.value ?? null
        }

        if (prop === 'value') {
            return obj.value ?? obj.defaultValue
        }

        if (prop === 'valueOf') {
            if ('value' in obj || 'defaultValue' in obj) {
                return function() {return obj.value ?? obj.defaultValue}
            }
            return obj.valueOf
        }

        const result = obj[prop] ?? obj.value?.[prop] ?? obj.defaultValue?.[prop]
        return isPlainObject(result) ? stateProxy(`${path}.${prop}`, result) : result
    }

})

export function stateProxy(path: string, storedState: object | undefined, initialValuesAndDefaults: object = {}) {
    const existingStateAtPath = storedState || {}
    const mergedState = mergeDeepWith(useRightIfDefined, initialValuesAndDefaults, existingStateAtPath)
    return new Proxy(mergedState, stateProxyHandler(path))
}

export const useObjectStateWithDefaults = (path: string, initialValuesAndDefaults: object) => {
    const existingStateAtPath = useObjectState(path)
    return stateProxy(path, existingStateAtPath, initialValuesAndDefaults)
}

export const getState = useStore.getState