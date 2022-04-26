import React, {useState} from 'react'
import AppRunnerFromCode from './AppRunnerFromCode'
import AppLoadError from './AppLoadError'
import {storage} from '../shared/configuredFirebase'
import {ref, getDownloadURL} from 'firebase/storage'
type Properties = {appCodePath: string}

export default function AppRunnerFromStorage({appCodePath}: Properties) {

    const [appCode, setAppCode] = useState<string | null>(null)
    const [appPathFetched, setAppPathFetched] = useState<string | null>(null)
    const [fetchError, setFetchError] = useState<Error | null>(null)
    if (appPathFetched !== appCodePath) {
        const storageRef = ref(storage, appCodePath)
        getDownloadURL(storageRef)
            .then(url => fetch(url))
            .then(resp => resp.text())
            .catch(error => setFetchError(error))
            .then(text => setAppCode(text ?? null))
        setAppPathFetched(appCodePath)
    }

    return fetchError !== null ? React.createElement(AppLoadError, {appUrl: appCodePath, error: fetchError})
        : appCode === null ? <p>Loading...</p> : <AppRunnerFromCode appCode={appCode}/>
}