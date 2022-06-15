import React, {createContext, useContext, useRef} from 'react'
import {createStore, useStore} from 'zustand'
import {stateProxy} from './stateProxy'
import AppState, {Changes} from './AppState'
import {equals, mergeDeepWith} from 'ramda'

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

const useRightIfDefined = (left: any, right: any) => right !== undefined ? right : left

const useObjectStateWithDefaults = <T>(elementPath: string, initialState?: object) => {
    const path = fixPath(elementPath)
    const selectState = (state: any) => [state.store.select(path), state.update]
    const compareOnlyState = (a: any[], b: any[]) => a[0] === b[0]
    const store = useContext(StoreContext)
    const [storedState, updateFn] = useStore(store, selectState, compareOnlyState)

    // Hack for _type until all removed
    if (initialState && '_type' in initialState) {
        // @ts-ignore
        const {_type, ...props} = initialState
        initialState = new _type(props)
    }

    let mergedState
    if (storedState && initialState){
        if (storedState.mergeProps) {
            mergedState = storedState.mergeProps(initialState)
        } else {
            const mergedProps = mergeDeepWith(useRightIfDefined, initialState || {}, storedState || {})
            const {_type, ...props} = mergedProps
            mergedState = _type ? new _type(props) : props
        }

        if (!equals(mergedState, storedState)) {
            updateFn(path, mergedState, true)
        }

    }
    else if (storedState) {
        mergedState = storedState

    } else if (initialState) {
        mergedState = initialState
        updateFn(path, mergedState, true)
    } else {
        mergedState = {}
    }

    return stateProxy(path, mergedState, updateFn)

    // if ((!storedState || path === 'app') && initialState) {
    //     if (isClassObject(initialState)) {
    //         updateFn(path, initialState, true)
    //     } else {
    //         updateFn(path, initialState)
    //     }
    // }
    //
    // const proxyTarget = () => {
    //     if (isClassObject(storedState)) {
    //         return storedState
    //     }
    //
    //     const mergedState = mergeDeepWith(useRightIfDefined, initialState || {}, storedState || {})
    //     const {_type, ...proxyState} = mergedState
    //     return _type ? new _type(proxyState) : proxyState
    // }
    //
    // return stateProxy(path, proxyTarget(), updateFn)
}

const StoreProvider = ({children}: {children: React.ReactNode}) => {
    const store = useRef(createStore(baseStore))
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider, useObjectStateWithDefaults}
