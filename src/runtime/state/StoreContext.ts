import React, {createContext, useRef} from 'react'
import AppStateStore from './AppStateStore'

export type AppStoreHook = {setAppStore(sa: AppStateStore): void}

export const StoreContext = createContext<AppStateStore>(null as unknown as AppStateStore)
const StoreProvider = ({children, appStoreHook}: { children: React.ReactNode, appStoreHook?: AppStoreHook }) => {
    const store = useRef(new AppStateStore())
    appStoreHook?.setAppStore(store.current)
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider}
