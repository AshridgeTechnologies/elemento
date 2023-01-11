import AppContext from '../runtime/AppContext'
import React, {useState} from 'react'
import Project from '../model/Project'
import AppRunnerFromCode from './AppRunnerFromCode'
import App from '../model/App'
import {generate} from '../generator/Generator'
import AppLoadError from './AppLoadError'
import {isEmpty} from 'ramda'
import {loadJSON} from '../model/loadJSON'
import AppRunnerFromSource from './AppRunnerFromSource'

type Properties = {username: string, repo: string, appContext: AppContext}

const CDN_HOST = 'https://cdn.jsdelivr.net'
const GITHUB_API_HOST = 'https://api.github.com'
const PROJECT_FILE_NAME = 'ElementoProject.json'

const generateAppCode = (project: Project) => {
    const app = project.elementArray().find( el => el.kind === 'App') as App
    const {errors, code: appCode} = generate(app, project)
    if (!isEmpty(errors)) {
        throw new Error(`Errors found in the app: ${JSON.stringify(errors, null, 2)}`)
    }
    return appCode
}

const getLatestCommitId = (username: string, repo: string): Promise<string> => {
    const gitCommitUrl = `${GITHUB_API_HOST}/repos/${username}/${repo}/commits`
    return fetch(gitCommitUrl)
        .then(resp => resp.json())
        .then(commits => commits[0].sha)
}

const getAppSource = (url: string): Promise<Project> => {
    return fetch(url)
        .then(resp => resp.json())
}

export default function AppRunnerFromGitHub({username, repo, appContext}: Properties) {
    const [usernameRepoFetched, setUsernameRepoFetched] = useState<string | null>(null)
    const [appUrl, setAppUrl] = useState<string | null>(null)

    const usernameRepo = username + '/' + repo
    if ( usernameRepoFetched !== usernameRepo) {
        getLatestCommitId(username, repo)
            .then( commitId => setAppUrl(`${CDN_HOST}/gh/${username}/${repo}@${commitId}`))
        setUsernameRepoFetched(usernameRepo)
    }

    if (appUrl === null) {
        return <p>Finding latest version...</p>
    }
    return <AppRunnerFromSource url={appUrl} appContext={appContext}/>
}