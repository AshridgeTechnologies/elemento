import React, {FunctionComponent, useEffect, useState} from 'react'
import AppRunner from './AppRunner'
import AppLoadError from './AppLoadError'
import {loadModuleHttp} from './loadModuleHttp'

type Properties = {url: string, pathPrefix: string, resourceUrl: string}

const isElementoOrigin = (origin: string) => {
    return ['localhost', 'elemento.online'].includes(new URL(origin).hostname)
}

export default function AppRunnerFromCodeUrl({url, pathPrefix, resourceUrl}: Properties) {
    const [appComponent, setAppComponent] = useState<FunctionComponent | null>(null)
    const [appFetched, setAppFetched] = useState<string | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [version, setVersion] = useState<number>(0)

    const isPreviewWindow = window.location.hostname === 'localhost'
    useEffect( ()=> {
        if (isPreviewWindow) {
            window.addEventListener("message", event => {
                if (event.data.type === 'refreshCode' && isElementoOrigin(event.origin)) {
                    setVersion((oldVersion) => oldVersion + 1)
                }
            })
        }
    }, [])

    const versionedUrl = url + (version === 0 ? '' : `?${version}`)
    if (appFetched !== versionedUrl) {
        loadModuleHttp(versionedUrl).then((module:any) => setAppComponent(() => module.default)).catch( setError )
        setAppFetched(versionedUrl)
    }

    if (error !== null) return <AppLoadError appUrl={url} error={error!}/>
    if (appComponent === null) return <p>Loading...</p>
    return React.createElement(AppRunner, {appFunction: appComponent!, pathPrefix, resourceUrl})
}
