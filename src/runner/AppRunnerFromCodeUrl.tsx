import React, {FunctionComponent, useState} from 'react'
import AppRunner from './AppRunner'
import AppContext from '../runtime/AppContext'
import AppLoadError from './AppLoadError'

type Properties = {url: string, appContext: AppContext, resourceUrl?: string, onComponentSelected?: (id: string) => void, selectedComponentId?: string}

export default function AppRunnerFromCodeUrl({url, appContext, resourceUrl, onComponentSelected  = () => {}, selectedComponentId}: Properties) {
    const [appComponent, setAppComponent] = useState<FunctionComponent | null>(null)
    const [appFetched, setAppFetched] = useState<string | null>(null)
    const [error, setError] = useState<Error | null>(null)

    if (appFetched !== url) {
        // hack to work around Parcel bug, suggested in https://github.com/parcel-bundler/parcel/issues/8316#issuecomment-1545787533
        const importPromise = new Function('url', `return import(url)`)(url) as Promise<any>
        importPromise.then( module => setAppComponent(() => module.default))
        setAppFetched(url)
    }

    if (error !== null) return <AppLoadError appUrl={url} error={error!}/>
    if (appComponent === null) return <p>Loading...</p>
    return React.createElement(AppRunner, {appFunction: appComponent!, appContext, resourceUrl, onComponentSelected, selectedComponentId})
}