import React, {createContext, useContext, useRef} from 'react'
import {createStore, StoreApi, useStore} from 'zustand'
import AppState from './AppState'
import {ComponentState} from './components/ComponentState'

type StoredState = ComponentState<any>
export type AppStore = {
    store: AppState,
    select: (path: string) => StoredState,
    update: (path: string, changes: StoredState) => void
    deferUpdates: () => void
}

export interface AppStateForObject {
    latest: () => any
    updateVersion: (newVersion: any) => void
}

const fixPath = (path: string) => {
    if (path === '') return path
    const [, ...remainingSegments] = path.split('.')
    return ['app', ...remainingSegments].join('.')
}

const loggingOn = false
const log = (...args: any[]) => loggingOn && console.log(...args)

const baseStore = (set: (updater: (state: AppStore) => object) => void, get: ()=> AppStore): AppStore => {
    const deferredUpdates = new Map<string, StoredState>()
    let timeout: any = null
    let deferringUpdates = false

    const commitDeferredUpdates = () => {
        log('commitDeferredUpdates')
        set((state: AppStore) => {
            let updatedStore = state.store
            deferredUpdates.forEach((newObject: StoredState, path: string ) => updatedStore = updatedStore.update(path, newObject))
            return {store: updatedStore}
        })

        deferredUpdates.clear()
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
                return get().select(path)
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

    return {
        store: new AppState({}),
        select(path) {
            return deferredUpdates.get(path) ?? this.store.select(path)
        },
        update,
        deferUpdates
    }
}

const StoreContext = createContext(createStore(baseStore))

const useObjectState = <T>(elementPath: string, initialState: T): T => {
    const path = fixPath(elementPath)
    const selectState = (state: any) => [state.select(path), state.update, state.deferUpdates]
    const compareOnlyState = (a: any[], b: any[]) => a[0] === b[0]
    const store = useContext(StoreContext)
    const [storedState, update, deferUpdates] = useStore(store, selectState, compareOnlyState)

    deferUpdates()
    if (storedState){
        const updatedState = storedState.updateFrom(initialState)
        if (updatedState !== storedState) {
            update(path, updatedState)
        }
        return updatedState
    } else  {
        update(path, initialState)
        return initialState
    }
}

const useGetObjectState = <T>(elementPath: string): T => {
    const path = fixPath(elementPath)
    const selectState = (state: any) => [state.select(path), state.deferUpdates]
    const compareOnlyState = (a: any[], b: any[]) => a[0] === b[0]
    const store = useContext(StoreContext)
    const [storedState, deferUpdates] = useStore(store, selectState, compareOnlyState)

    deferUpdates()
    if (!storedState) {
        throw new Error('Cannot use object state that has not been initialised: ' + elementPath)
    }
    return storedState
}

const StoreProvider = ({children, appStoreHook = {setAppStore(x: any){}}}: {children: React.ReactNode, appStoreHook?: {setAppStore(sa: StoreApi<AppStore>): void}} ) => {
    const store = useRef(createStore(baseStore))
    appStoreHook.setAppStore(store.current)
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider, useObjectState, useGetObjectState}

