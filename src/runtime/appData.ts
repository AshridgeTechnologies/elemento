import create from 'zustand'
import {clone, equals, lensPath, mergeDeepRight, mergeDeepWith, set, view} from 'ramda'
import {isBoolean, isNumber, isObject, isPlainObject, isString} from 'lodash'
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
const valueOfFn = function (this: any) { return this.value !== undefined ? this.value : this.defaultValue }
const updateFn = function (this: any, changes: object, replace: boolean = false) { replace ? setState(this._path, changes) : updateState(this._path, changes) }
const addPath = (obj: object, path: string) => {
    const updatableObj = obj as any
    Object.defineProperty(updatableObj, '_path', {value: path})
    Object.defineProperty(updatableObj, '_update', {value: updateFn})
    if ('value' in updatableObj || 'defaultValue' in updatableObj) {
        updatableObj.valueOf = valueOfFn
    }
    for (const p in obj) {
        const prop = obj[p as keyof object]
        if (isPlainObject(prop) || (isObject(prop) && (isString(prop) || isNumber(prop) || isBoolean(prop)))) {
            addPath(prop, `${path}.${p}`)
        }
    }
}

export const useObjectStateWithDefaults = (path: string, defaults: object) => {
    const existingStateAtPath = useObjectState(path) || {}
    const mergedState = mergeDeepWith(useRightIfDefined, defaults, existingStateAtPath)
    const mergedStateCopy = clone(mergedState)

    addPath(mergedStateCopy, path)
    return mergedStateCopy
}

export const getState = useStore.getState