import React, {createRef, useEffect} from 'react'
import {StoreProvider} from '../runtime/appData'
import {highlightElement} from '../runtime/runtimeFunctions'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import AppContext from '../runtime/AppContext'

function SelectionProvider({children, onComponentSelected, selectedComponentId}: {children: React.ReactNode, onComponentSelected: (id: string) => void, selectedComponentId?: string}) {
    const containerRef = createRef()

    const selectionEventListener = (event: MouseEvent) => {
        if (event.altKey) {
            event.preventDefault()
            event.stopPropagation()
            const target = event.target as HTMLElement
            const id = target.id || target.closest('[id]')?.id
            if (id) {
                onComponentSelected(id)
            }
        }
    }
    useEffect(() => (containerRef.current as HTMLElement).addEventListener('click', selectionEventListener) )
    useEffect(() => {
        if (selectedComponentId) {
            highlightElement(selectedComponentId)
        }
    })
    // @ts-ignore
    return <div id='selectionProvider' style={{height: '100%', width:'100%'}} ref={containerRef}>{children}</div>
}

type Properties = {appFunction: React.FunctionComponent<any>, appContext: AppContext, onComponentSelected: (id: string) => void, selectedComponentId?: string}

export default function AppRunner({appFunction, appContext, onComponentSelected, selectedComponentId}: Properties) {
    return <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[appFunction]}>
        <StoreProvider>
            <SelectionProvider onComponentSelected={onComponentSelected} selectedComponentId={selectedComponentId}>
                {React.createElement(appFunction, {appContext})}
            </SelectionProvider>
        </StoreProvider>
    </ErrorBoundary>
}