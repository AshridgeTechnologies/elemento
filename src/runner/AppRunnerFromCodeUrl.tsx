import React, {FunctionComponent, useState} from 'react'
import AppRunner from './AppRunner'
import AppContext from '../runtime/AppContext'
import AppLoadError from './AppLoadError'
import {loadModuleHttp} from './loadModuleHttp'

type Properties = {url: string, appContext: AppContext, resourceUrl?: string, onComponentSelected?: (id: string) => void, selectedComponentId?: string}

export default function AppRunnerFromCodeUrl({url, appContext, resourceUrl, onComponentSelected  = () => {}, selectedComponentId}: Properties) {
    const [appComponent, setAppComponent] = useState<FunctionComponent | null>(null)
    const [appFetched, setAppFetched] = useState<string | null>(null)
    const [error, setError] = useState<Error | null>(null)

    if (appFetched !== url) {
        loadModuleHttp(url).then((module:any) => setAppComponent(() => module.default)).catch( setError )
        setAppFetched(url)
    }

    if (error !== null) return <AppLoadError appUrl={url} error={error!}/>
    if (appComponent === null) return <p>Loading...</p>
    return React.createElement(AppRunner, {appFunction: appComponent!, appContext, resourceUrl, onComponentSelected, selectedComponentId})
}