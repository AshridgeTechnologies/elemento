import React, {createContext, useContext, useEffect, useRef} from 'react'
import {LocalizationProvider} from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3'
import {enGB} from 'date-fns/locale/en-GB'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import {DefaultUrlContext, UrlContextContext} from '../runtime/UrlContext'
import PreviewController from '../shared/PreviewController'
import {exposeFunctions} from '../shared/postmsgRpc/server'
import AppStateStore from '../runtime/AppStateStore'

export const useGetUrlContext = () => useContext(UrlContextContext)
export type AppStoreHook = {setAppStore(sa: AppStateStore): void}

export const StoreContext = createContext<AppStateStore>(null as unknown as AppStateStore)

function PreviewWrapper({children}: {children: React.ReactNode}) {
    const isPreviewWindow = window.location.hostname === 'localhost'
    const store = useContext(StoreContext)

    useEffect( ()=> {
        if (isPreviewWindow) {
            const controller = new PreviewController(window, store)
            const closeFn = exposeFunctions('Preview', controller)
            console.log('Preview controller initialised in app window')
            return closeFn
        }
    }, [])

    return <>{children}</>
}

type Properties = {appFunction: React.FunctionComponent<any>, pathPrefix: string, resourceUrl?: string }

const StoreProvider = ({children}: { children: React.ReactNode, appStoreHook?: AppStoreHook }) => {
    const store = useRef(new AppStateStore())
    return React.createElement(StoreContext.Provider, {value: store.current, children})
}

export default function AppRunner({appFunction, pathPrefix, resourceUrl}: Properties) {
    const urlContext = new DefaultUrlContext(pathPrefix, resourceUrl)
    return <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[appFunction]}>
        <StoreProvider>
            <UrlContextContext.Provider value={urlContext}>
                <PreviewWrapper>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        {React.createElement(appFunction, {})}
                    </LocalizationProvider>
                </PreviewWrapper>
            </UrlContextContext.Provider>
        </StoreProvider>
    </ErrorBoundary>
}
export {StoreProvider}
