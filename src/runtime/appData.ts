import create from 'zustand'
import {lensPath, mergeDeepRight, view, set, equals} from 'ramda'


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

export const useObjectStateWithDefaults = (path: string, defaults: object) => {
    const existingStateAtPath = useObjectState(path) || {}
    const stateWithDefaults = mergeDeepRight(defaults, existingStateAtPath)
    return stateWithDefaults
}

export const getState = useStore.getState