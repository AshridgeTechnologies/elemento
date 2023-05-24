import {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import {DefaultAppContext} from '../runtime/AppContext'
import AppRunnerFromGitHub from './AppRunnerFromGitHub'

type Properties = {windowUrlPath: string}

const getAppContext = (pathPrefix: string | null = null) => new DefaultAppContext(pathPrefix)

export default function AppMain({windowUrlPath}: Properties) {
    const path = decodeURIComponent(windowUrlPath)
    const githubMatch = path.match(/(.*)\/gh\/([-\w]+)\/([-\w]+)\/([-\w]+)/)
    if (githubMatch) {
        const [, firstPart, username, repo, appName] = githubMatch
        const pathPrefix = `${firstPart}/gh/${username}/${repo}`
        return createElement(AppRunnerFromGitHub, {username, repo, appName, appContext: getAppContext(pathPrefix)})
    }

    return createElement('h1', 'Sorry - we could not find the Elemento app you are trying to run')
}

export const runAppFromWindowUrl = (windowUrlPath: string = location.pathname, containerElementId = 'main') => {
    const container = document.createElement('div')
    container.id = containerElementId
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(createElement(AppMain, {windowUrlPath}))
}
