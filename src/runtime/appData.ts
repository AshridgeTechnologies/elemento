import React from 'react'
import create from 'zustand'
import {stateProxy} from './stateProxy'
import DataStore, {Changes} from './DataStore'
import createContext from 'zustand/context'

type StoreType = {
    store: DataStore,
    update: (path: string, changes: Changes, replace: boolean) => void
}

const baseStore = (set: (updater: (state: StoreType) => object) => void): StoreType => ({
    store: new DataStore({app: {}}),
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

const useObjectStateWithDefaults = (path: string, initialValuesAndDefaults: object) => {
    const selectState = (state: any) => [state.store.select(path), state.update]
    const compareOnlyState = (a: any[], b: any[]) => a[0] === b[0]
    const [existingStateAtPath, updateFn] = useStore(selectState, compareOnlyState)
    return stateProxy(path, existingStateAtPath, initialValuesAndDefaults, updateFn)
}

const StoreProvider = ({children}: {children: React.ReactNode}) => React.createElement(Provider, {createStore, children})
export {StoreProvider, useObjectStateWithDefaults}
