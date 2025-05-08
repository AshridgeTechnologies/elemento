import React, {createContext, useRef} from 'react'
import AppStateStore from '../runtime/AppStateStore'

export type AppStoreHook = {setAppStore(sa: AppStateStore): void}

//in separate file to avoid pulling AppRunner into all tests
export const StoreContext = createContext<AppStateStore>(null as unknown as AppStateStore)
const StoreProvider = ({children}: { children: React.ReactNode, appStoreHook?: AppStoreHook }) => {
    const store = useRef(new AppStateStore())
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}
export {StoreProvider}
