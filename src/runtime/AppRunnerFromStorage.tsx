import React, {useState} from 'react'
import AppRunnerFromCode from './AppRunnerFromCode'
import AppLoadError from './AppLoadError'
import {getTextFromStorage} from '../shared/storage'

type Properties = {appCodePath: string}

export default function AppRunnerFromStorage({appCodePath}: Properties) {

    const [appCode, setAppCode] = useState<string | null>(null)
    const [appPathFetched, setAppPathFetched] = useState<string | null>(null)
    const [fetchError, setFetchError] = useState<Error | null>(null)
    if (appPathFetched !== appCodePath) {
        getTextFromStorage(appCodePath)
            .catch(error => setFetchError(error))
            .then(text => setAppCode(text ?? null))
        setAppPathFetched(appCodePath)
    }

    return fetchError !== null ? React.createElement(AppLoadError, {appUrl: appCodePath, error: fetchError})
        : appCode === null ? <p>Loading...</p> : <AppRunnerFromCode appCode={appCode}/>
}