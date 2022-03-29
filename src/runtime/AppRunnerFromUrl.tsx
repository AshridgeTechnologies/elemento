import React, {useState} from 'react'
import AppRunnerFromCode from './AppRunnerFromCode'
import AppLoadError from './AppLoadError'

type Properties = {appCodeUrl: string}

export default function AppRunnerFromUrl({appCodeUrl}: Properties) {
    const appUrlToFetch = appCodeUrl.replace(/www.dropbox.com/, 'dl.dropboxusercontent.com')

    const [appCode, setAppCode] = useState<string | null>(null)
    const [appUrlFetched, setAppUrlFetched] = useState<string | null>(null)
    const [fetchError, setFetchError] = useState<Error | null>(null)
    if ( appUrlFetched !== appUrlToFetch) {
            fetch(appUrlToFetch)
                .then(resp => resp.text())
                .catch(error => setFetchError(error))
                .then(text => setAppCode(text ?? null))
            setAppUrlFetched(appUrlToFetch)
    }

    return fetchError !== null ? React.createElement(AppLoadError, {appUrl: appCodeUrl, error: fetchError})
        : appCode === null ? <p>Loading...</p> : <AppRunnerFromCode appCode={appCode}/>
}