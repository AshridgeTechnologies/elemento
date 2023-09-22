import {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import {DefaultAppContext} from '../runtime/AppContext'
import AppRunnerFromGitHub from './AppRunnerFromGitHub'
import AppRunnerFromCodeUrl from './AppRunnerFromCodeUrl'
import {runForDev} from '../runtime/run'
import {ASSET_DIR} from '../shared/constants'

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

    const hostServerMatch = path.match(/\/(.*\/)?([-\w]+)(\/)?(index.html)?$/)
    if (hostServerMatch) {
        const [, firstPart, appName] = hostServerMatch
        const pathPrefix = `${firstPart}${appName}`
        const appCodeUrl = '/' + pathPrefix + '/' + appName + '.js'
        const resourceUrl = `${firstPart}/${ASSET_DIR}`

        console.log('Loading app from', appCodeUrl, 'resource url', resourceUrl)
        return createElement(AppRunnerFromCodeUrl, {url: appCodeUrl, appContext: getAppContext(resourceUrl)})
    }

    return createElement('h4', null, 'Sorry - we could not find the Elemento app you are trying to run from ', windowUrlPath)
}

export const runAppFromWindowUrl = (windowUrlPath: string = location.pathname, containerElementId = 'main') => {
    if (windowUrlPath.startsWith('/studio/preview')) {
        runForDev(windowUrlPath)
    } else {
        const container = document.createElement('div')
        container.id = containerElementId
        document.body.appendChild(container)
        const root = createRoot(container)
        root.render(createElement(AppMain, {windowUrlPath}))
    }
}
