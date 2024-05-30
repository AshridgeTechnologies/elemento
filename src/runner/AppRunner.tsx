import React, {createRef, useContext, useEffect} from 'react'
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import enGB from 'date-fns/locale/en-GB'
import {AppStoreHook, StoreProvider} from '../runtime/appData'
import {highlightElement} from '../runtime/runtimeFunctions'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import AppContext, {DefaultAppContext} from '../runtime/AppContext'
import AppUtils from '../runtime/AppUtils'

export const AppUtilsContext = React.createContext<AppUtils | null>(null)
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
    onComponentSelected: (id: string) => void, selectedComponentId?: string, appStoreHook?: AppStoreHook }

export default function AppRunner({appFunction, pathPrefix, resourceUrl, onComponentSelected, selectedComponentId, appStoreHook}: Properties) {
    return <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[appFunction]}>
        <StoreProvider appStoreHook={appStoreHook}>
            <AppUtilsContext.Provider value={new AppUtils(resourceUrl)}>
            <AppContextContext.Provider value={new DefaultAppContext(pathPrefix)}>
                <SelectionProvider onComponentSelected={onComponentSelected} selectedComponentId={selectedComponentId}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        {React.createElement(appFunction, {})}
                    </LocalizationProvider>
                </SelectionProvider>
            </AppContextContext.Provider>
            </AppUtilsContext.Provider>
        </StoreProvider>
    </ErrorBoundary>
}
