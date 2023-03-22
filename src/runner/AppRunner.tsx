import React, {createRef, useEffect} from 'react'
import {AppStoreHook, StoreProvider} from '../runtime/appData'
import {highlightElement} from '../runtime/runtimeFunctions'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import AppContext from '../runtime/AppContext'
import AppUtils from '../runtime/AppUtils'

export const AppUtilsContext = React.createContext<AppUtils | null>(null)

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
    useEffect(() => highlightElement(selectedComponentId), [selectedComponentId])
    // @ts-ignore
    return <div id='selectionProvider' style={{height: '100%', width:'100%'}} ref={containerRef}>{children}</div>
}

type Properties = {appFunction: React.FunctionComponent<any>, appContext: AppContext, resourceUrl?: string,
    onComponentSelected: (id: string) => void, selectedComponentId?: string, appStoreHook?: AppStoreHook }

export default function AppRunner({appFunction, appContext, resourceUrl, onComponentSelected, selectedComponentId, appStoreHook}: Properties) {
    return <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[appFunction]}>
        <StoreProvider appStoreHook={appStoreHook}>
            <AppUtilsContext.Provider value={new AppUtils(resourceUrl)}>
                <SelectionProvider onComponentSelected={onComponentSelected} selectedComponentId={selectedComponentId}>
                    {React.createElement(appFunction, {appContext})}
                </SelectionProvider>
            </AppUtilsContext.Provider>
        </StoreProvider>
    </ErrorBoundary>
}