import AppContext from '../runtime/AppContext'
import React, {useState} from 'react'
import AppRunnerFromCodeUrl from './AppRunnerFromCodeUrl'
import {ASSET_DIR} from '../shared/constants'

type Properties = {username: string, repo: string, appName: string, subPath?: string, appContext: AppContext}

const CDN_HOST = 'https://cdn.jsdelivr.net'
const GITHUB_API_HOST = 'https://api.github.com'
const getLatestCommitId = (username: string, repo: string): Promise<string> => {
    const gitCommitUrl = `${GITHUB_API_HOST}/repos/${username}/${repo}/commits`
    return fetch(gitCommitUrl)
        .then(resp => resp.json())
        .then(commits => commits[0].sha)
}
export default function AppRunnerFromGitHub({username, repo, appName, subPath, appContext}: Properties) {
    const [usernameRepoFetched, setUsernameRepoFetched] = useState<string | null>(null)
    const [appUrl, setAppUrl] = useState<string | null>(null)

    const usernameRepo = username + '/' + repo
    if ( usernameRepoFetched !== usernameRepo) {
        getLatestCommitId(username, repo)
            .then( commitId => {
                const clientUrl = `${CDN_HOST}/gh/${username}/${repo}@${commitId}/dist/client` + (subPath ? '/' + subPath : '')
                return setAppUrl(clientUrl)
            })
        setUsernameRepoFetched(usernameRepo)
    }

    if (appUrl === null) {
        return <p>Finding latest version...</p>
    }

    const codeUrl = `${appUrl}/${appName}/${appName}.js`
    const resourceUrl = `${appUrl}/${ASSET_DIR}`
    return <AppRunnerFromCodeUrl url={codeUrl} resourceUrl={resourceUrl} appContext={appContext}/>
}
