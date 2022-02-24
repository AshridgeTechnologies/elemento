import create from 'zustand'
import {clone, equals, lensPath, mergeDeepRight, mergeDeepWith, set, view} from 'ramda'
import {isPlainObject} from 'lodash'


type baseStoreType = {app: {}}
const baseStore = ():baseStoreType => ({app: {}})

const lensFor = (path: string) => lensPath(path.split('.'))

export const useStore = create( () => (baseStore()) )

export const updateState = (path: string, changes: object) => {
    const lens = lensFor(path)
    const existingState = useStore.getState()
    const existingStateAtPath = view(lens, existingState)
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
const updateFn = function (this: any, changes: object) { updateState(this._path, changes) }
const addPath = (obj: object, path: string) => {
    const updatableObj = obj as any
    updatableObj._path = path;
    updatableObj.update = updateFn
    if ('value' in updatableObj || 'defaultValue' in updatableObj) {
        updatableObj.valueOf = valueOfFn
    }
    for (const p in obj) {
        const prop = obj[p as keyof object]
        if (isPlainObject(prop)) {
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