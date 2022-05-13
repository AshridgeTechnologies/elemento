import React from 'react'
import create from 'zustand'
import {stateProxy} from './stateProxy'
import AppState, {Changes} from './AppState'
import createContext from 'zustand/context'

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

const { Provider, useStore } = createContext<StoreType>()

const createStore = () => create(baseStore)

const useObjectStateWithDefaults = <T>(elementPath: string, initialValues?: object) => {
    const path = fixPath(elementPath)
    const selectState = (state: any) => [state.store.select(path), state.update]
    const compareOnlyState = (a: any[], b: any[]) => a[0] === b[0]
    const [existingStateAtPath, updateFn] = useStore(selectState, compareOnlyState)
    if ((!existingStateAtPath || path === 'app') && initialValues) {
        updateFn(path, initialValues)
    }
    return stateProxy(path, existingStateAtPath, initialValues, updateFn)
}

const StoreProvider = ({children}: {children: React.ReactNode}) => React.createElement(Provider, {createStore, children})
export {StoreProvider, useObjectStateWithDefaults}
