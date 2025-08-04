import React, {useContext, useEffect} from 'react'
import {LocalizationProvider} from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import {enGB} from 'date-fns/locale/en-GB'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import {DefaultUrlContext, UrlContextContext} from '../runtime/UrlContext'
import PreviewController from '../shared/PreviewController'
import {exposeFunctions} from '../shared/postmsgRpc/server'
import {StoreProvider, StoreContext} from './StoreContext'

export const useGetUrlContext = () => useContext(UrlContextContext)

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
