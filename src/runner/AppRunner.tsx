import React, {createRef, useContext, useEffect} from 'react'
import {LocalizationProvider} from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3'
import {enGB} from 'date-fns/locale/en-GB'
import {AppStoreHook, StoreProvider} from '../runtime/appData'
import {highlightElement} from '../runtime/runtimeFunctions'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import AppContext, {AppContextHook, DefaultAppContext} from '../runtime/AppContext'

export const AppContextContext = React.createContext<AppContext | null>(null)

export const useGetAppContext = () => useContext(AppContextContext)

function SelectionProvider({children, onComponentSelected, selectedComponentId}: {children: React.ReactNode, onComponentSelected: (id: string) => void, selectedComponentId?: string}) {
    const containerRef = createRef()

    const selectionEventListener = (event: MouseEvent) => {
        if (event.altKey && onComponentSelected) {
            event.preventDefault()
            event.stopPropagation()
            const target = event.target as HTMLElement
            const id = target.id || target.closest('[id]')?.id
            if (id) {
                onComponentSelected(id)
            }
        }
    }
    useEffect(() => (containerRef.current as HTMLElement).addEventListener('click', selectionEventListener), [] )
    useEffect(() => highlightElement(selectedComponentId))
    // @ts-ignore
    return <div id='selectionProvider' style={{height: '100%', width:'100%'}} ref={containerRef}>{children}</div>
}

type Properties = {appFunction: React.FunctionComponent<any>, pathPrefix: string, resourceUrl?: string,
    onComponentSelected: (id: string) => void, selectedComponentId?: string, appStoreHook?: AppStoreHook, appContextHook?: AppContextHook }

export default function AppRunner({appFunction, pathPrefix, resourceUrl, onComponentSelected, selectedComponentId, appStoreHook, appContextHook}: Properties) {
    const appContext = new DefaultAppContext(pathPrefix, resourceUrl)
    appContextHook?.(appContext)
    return <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[appFunction]}>
        <StoreProvider appStoreHook={appStoreHook}>
            <AppContextContext.Provider value={appContext}>
                <SelectionProvider onComponentSelected={onComponentSelected} selectedComponentId={selectedComponentId}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        {React.createElement(appFunction, {})}
                    </LocalizationProvider>
                </SelectionProvider>
            </AppContextContext.Provider>
        </StoreProvider>
    </ErrorBoundary>
}
