import AppContext from '../runtime/AppContext'
import React, {useState} from 'react'
import Project from '../model/Project'
import AppRunnerFromCode from './AppRunnerFromCode'
import App from '../model/App'
import {generate} from '../generator/Generator'
import AppLoadError from './AppLoadError'
import {isEmpty} from 'ramda'
import {loadJSON} from '../model/loadJSON'

type Properties = {url: string, appContext: AppContext}

const PROJECT_FILE_NAME = 'ElementoProject.json'

const generateAppCode = (project: Project) => {
    const app = project.elementArray().find( el => el.kind === 'App') as App
    const {errors, code: appCode} = generate(app, project)
    if (!isEmpty(errors)) {
        throw new Error(`Errors found in the app: ${JSON.stringify(errors, null, 2)}`)
    }
    return appCode
}

export default function AppRunnerFromSource({url, appContext}: Properties) {
    const [appCode, setAppCode] = useState<string | null>(null)
    const [appFetched, setAppFetched] = useState<string | null>(null)
    const [error, setError] = useState<Error | null>(null)

    const appToFetch = url
    if (appFetched !== appToFetch) {
        const appUrlToFetch = `${url}/${PROJECT_FILE_NAME}`
        fetch(appUrlToFetch)
            .then(resp => resp.json())
            .then(json => {
                const project = loadJSON(json) as Project
                setAppCode(generateAppCode(project))
            })
            .catch(error => setError(error))
        setAppFetched(appToFetch)
    }

    if (error !== null) return <AppLoadError appUrl={appToFetch} error={error}/>
    if (appCode === null) return <p>Loading...</p>
    return<AppRunnerFromCode appCode={appCode} appContext={appContext}/>
}