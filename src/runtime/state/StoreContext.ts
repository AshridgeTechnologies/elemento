import React, {createContext, useRef} from 'react'
import {ComponentStateStore} from './BaseComponentState'
import AppStateStore from './AppStateStore'

export const StoreContext = createContext(new ComponentStateStore())

const StoreProvider = ({children, appStore}: { children: React.ReactNode, appStore?: AppStateStore }) => {
    const store = useRef(appStore ?? new ComponentStateStore())
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider}
