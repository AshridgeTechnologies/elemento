import React, {createContext, useContext, useRef} from 'react'
import {createStore, type StoreApi, useStore} from 'zustand'
import AppState from './AppState'
import {ComponentState} from './components/ComponentState'
import {mapKeys, mapValues} from 'lodash'
import {shallow} from 'zustand/shallow'
import {zipObj} from 'ramda'
import {notBlank} from '../util/helpers'

type StoredState = ComponentState<any>
export type StateMap = {[key: string]: StoredState}
type SetStoredStates = (initialStates: StateMap) => StateMap
type GetStoredStates = (paths: string[]) => StateMap
export type AppStore = {
    store: AppState,
    select: (...paths: string[]) => StateMap,
    setStoredStates: SetStoredStates,
    getStoredStates: GetStoredStates
}

export interface AppStateForObject {
    latest: () => any
    updateVersion: (newVersion: any) => void,
    getChildState: (subPath: string) => StoredState
}

export type AppStoreHook = {setAppStore(sa: StoreApi<AppStore>): void}

const fixPath = (path: string, pathPrefix: string | undefined) => {
    const fullPath = [pathPrefix, path].filter(notBlank).join('.')
    if (fullPath === '') return fullPath
    const [, ...remainingSegments] = fullPath.split('.')
    return ['app', ...remainingSegments].join('.')
}

let loggingOn = false
const log = (...args: any[]) => loggingOn && console.log(...args)

const baseStore = (set: (updater: (state: AppStore) => object) => void, get: ()=> AppStore): AppStore => {
    const deferredUpdates = new Map<string, StoredState>()
    let timeout: any = null
    let deferringUpdates = false

    const stateAt = (path: string) => get().select(path)[path]

    const commitDeferredUpdates = () => {
        log('commitDeferredUpdates')
        if (deferredUpdates.size) {
            set((state: AppStore) => {
                let updatedStore = state.store
                deferredUpdates.forEach((newObject: StoredState, path: string ) => updatedStore = updatedStore.update(path, newObject))
                return {store: updatedStore}
            })
            deferredUpdates.clear()
        }

        timeout = null
        deferringUpdates = false
    }

    const deferUpdates = () => {
        if (!deferringUpdates) {
            log('deferUpdates')
            deferringUpdates = true
            timeout = setTimeout(commitDeferredUpdates, 0)
        }
    }

    const storeDeferredUpdate = (path: string, newObject: StoredState) => {
        log('storeDeferredUpdate', path)
        deferredUpdates.set(path, newObject)
    }

    const update = (path: string, newObject: StoredState) => {
        const appStateInterface = {
            updateVersion(newVersion: StoredState) {
                update(path, newVersion)
            },
            latest() {
                return stateAt(path)
            },
            getChildState(subPath: string): StoredState {
                const fullPath = path + '.' + subPath
                return deferredUpdates.get(fullPath) ?? stateAt(fullPath)
            }
        } as AppStateForObject

        (newObject as any).init(appStateInterface)
        if (deferringUpdates) {
            storeDeferredUpdate(path, newObject)
        } else {
            log('immediate update', path)
            set((state: AppStore) => {
                const store = state.store
                const updatedStore = store.update(path, newObject)
                return {store: updatedStore}
            })
        }
    }

    const getStoredState = <T extends StoredState>(path: string): T => {
        const storedState = stateAt(path)
        deferUpdates()
        if (!storedState) {
            throw new Error('Cannot use object state that has not been initialised: ' + path)
        }
        return storedState as T
    }

    const setStoredState = <T extends StoredState>(path: string, initialState: T) => {
        const storedState = stateAt(path)
        deferUpdates()
        if (storedState) {
            const updatedState = storedState.updateFrom(initialState)
            if (updatedState !== storedState) {
                update(path, updatedState)
            }
            return updatedState
        } else {
            update(path, initialState)
            return initialState
        }
    }

    const getStoredStates = (paths: string[]): StateMap => {
        const entries = paths.map( p => [p, getStoredState(p)])
        return Object.fromEntries(entries)
    }

    const setStoredStates = (initialStates: StateMap): StateMap => {
        return mapValues(initialStates, (state, path) => setStoredState(path, state as StoredState))
    }

    return {
        store: new AppState({}),
        select(...paths) {
            const entries = paths.map( path => [path, deferredUpdates.get(path) ?? this.store.select(path)])
            return Object.fromEntries(entries)
        },
        setStoredStates,
        getStoredStates,
    }
}

const StoreContext = createContext<StoreApi<AppStore>>(null as unknown as StoreApi<AppStore>)

const setOrCreateStoredStates = <T extends StoredState>(store: StoreApi<AppStore>, initialStates: StateMap, pathPrefix: string | undefined): StateMap => {
    const initialStatesFixedPaths = mapKeys(initialStates, (_, path) => fixPath(path, pathPrefix))
    const fixedPaths = Object.keys(initialStatesFixedPaths)
    const selectStates = (state: AppStore): [StateMap, SetStoredStates] => [state.select(...fixedPaths), state.setStoredStates]
    const compareOnlyStates = (a: any[], b: any[]) => shallow(a[0], b[0])
    const [_storedState, setStoredStatesInStore] = useStore(store, selectStates, compareOnlyStates)
    const states = setStoredStatesInStore(initialStatesFixedPaths)
    return zipObj(Object.keys(initialStates), Object.values(states))
}

const getStoredStates = <T>(store: StoreApi<AppStore>, elementPaths: string[], pathPrefix: string | undefined): StateMap => {
    const fixedPaths = elementPaths.map(path => fixPath(path, pathPrefix))
    const selectStates = (state: AppStore): [StateMap, GetStoredStates] => [state.select(...fixedPaths), state.getStoredStates]
    const compareOnlyStates = (a: any[], b: any[]) => shallow(a[0], b[0])
    const [_storedState, getStoredStatesFromStore] = useStore(store, selectStates, compareOnlyStates)
    const states = getStoredStatesFromStore(fixedPaths)
    return zipObj(elementPaths, Object.values(states))
}

const useObjectState = <T extends StoredState>(elementPath: string, initialState: T): T => {
    return useObjectStates({[elementPath]: initialState})[elementPath] as T
}

const useGetObjectState = <T extends StoredState>(elementPath: string): T => {
    return useGetObjectStates([elementPath])[elementPath] as T
}

const useObjectStates = (initialStates: StateMap, pathPrefix?: string) => {
    const store = useContext(StoreContext)
    return setOrCreateStoredStates(store, initialStates, pathPrefix)
}

const useGetObjectStates = (elementPaths: string[], pathPrefix?: string) => {
    const store = useContext(StoreContext)
    return getStoredStates(store, elementPaths, pathPrefix)
}

const StoreProvider = ({children, appStoreHook}: {children: React.ReactNode, appStoreHook?: AppStoreHook} ) => {
    const store = useRef(createStore(baseStore))
    appStoreHook?.setAppStore(store.current)
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider, useObjectState, useGetObjectState, useObjectStates, useGetObjectStates, fixPath}

