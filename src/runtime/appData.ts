import React, { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'
import {stateProxy} from './stateProxy'
import AppState, {Changes} from './AppState'

type StoreType = {
    store: AppState,
    update: (path: string, changes: Changes, replace: boolean) => void
}

const fixPath = (path: string) => {
    if (path === '') return path
    const [, ...remainingSegments] = path.split('.')
    return ['app', ...remainingSegments].join('.')
}

const baseStore = (set: (updater: (state: StoreType) => object) => void): StoreType => ({
    store: new AppState({app: {}}),
    update(path: string, changes: Changes, replace = false) {
        set((state: StoreType) => {
            const store = state.store
            const updatedStore = store.update(path, changes, replace)
            return {store: updatedStore}
        })
    }
})

const StoreContext = createContext(createStore(baseStore))

const useObjectStateWithDefaults = <T>(elementPath: string, initialValues?: object) => {
    const path = fixPath(elementPath)
    const selectState = (state: any) => [state.store.select(path), state.update]
    const compareOnlyState = (a: any[], b: any[]) => a[0] === b[0]
    const store = useContext(StoreContext)
    const [existingStateAtPath, updateFn] = useStore(store, selectState, compareOnlyState)
    if ((!existingStateAtPath || path === 'app') && initialValues) {
        updateFn(path, initialValues)
    }
    return stateProxy(path, existingStateAtPath, initialValues, updateFn)
}

const StoreProvider = ({children}: {children: React.ReactNode}) => {
    const store = useRef(createStore(baseStore))
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider, useObjectStateWithDefaults}
