import React, {createContext, useRef} from 'react'
import AppStateStore from './AppStateStore'

export const StoreContext = createContext<AppStateStore>(new AppStateStore())

const StoreProvider = ({children, appStore}: { children: React.ReactNode, appStore?: AppStateStore }) => {
    const store = useRef(appStore ?? new AppStateStore())
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider}
