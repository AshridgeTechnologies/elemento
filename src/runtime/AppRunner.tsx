import React, {createRef, useEffect} from 'react'
import {StoreProvider} from './appData'
import {highlightElement} from './runtimeFunctions'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'

function SelectionProvider({children, onComponentSelected, selectedComponentId}: {children: React.ReactNode, onComponentSelected: (id: string) => void, selectedComponentId?: string}) {
    const containerRef = createRef()

    const selectionEventListener = (event: MouseEvent) => {
        if (event.altKey) {
            event.preventDefault()
            event.stopPropagation()
            onComponentSelected((event.target as HTMLElement).id)
        }
    }
    useEffect(() => (containerRef.current as HTMLElement).addEventListener('click', selectionEventListener) )
    useEffect(() => {
        if (selectedComponentId) {
            highlightElement(selectedComponentId)
        }
    })
    // @ts-ignore
    return <div ref={containerRef}>{children}</div>
}

type Properties = {appFunction: React.FunctionComponent<any>, onComponentSelected: (id: string) => void, selectedComponentId?: string}

export default function AppRunner({appFunction, onComponentSelected, selectedComponentId}: Properties) {
    return <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[appFunction]}>
        <StoreProvider>
            <SelectionProvider onComponentSelected={onComponentSelected} selectedComponentId={selectedComponentId}>
                {React.createElement(appFunction)}
            </SelectionProvider>
        </StoreProvider>
    </ErrorBoundary>
}