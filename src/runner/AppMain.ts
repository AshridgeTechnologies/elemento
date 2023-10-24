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

    const githubMatch = path.match(/(.*)\/gh\/([-\w]+)\/([-\w]+)\/([-/\w]+\/)?([-\w]+)$/)
    if (githubMatch) {
        const [, firstPart, username, repo, pathWithSlash, appName] = githubMatch
        const path = pathWithSlash?.slice(0, -1)
        const pathPrefix = `${firstPart}/gh/${username}/${repo}/${path}`
        return createElement(AppRunnerFromGitHub, {username, repo, appName, path, appContext: getAppContext(pathPrefix)})
    }

    const localMatch = path.match(/^\/run\/local\/(opfs|disk)\/([-\w]+)\/([-\w]+)\/?(index.html)?$/)
    if (localMatch) {
        const [, area, projectName, appName] = localMatch
        const pathPrefix = `run/local/${area}/${projectName}/${appName}`
        const appCodeUrl = '/' + pathPrefix + '/' + appName + '.js'
        const resourceUrl = `/run/local/${area}/${projectName}/${ASSET_DIR}`

        console.log('Loading local app from', appCodeUrl, 'resource url', resourceUrl)
        return createElement(AppRunnerFromCodeUrl, {url: appCodeUrl, resourceUrl, appContext: getAppContext(pathPrefix)})
    }

    const hostServerMatch = path.match(/\/(.*\/)?([-\w]+)(\/)?(index.html)?$/)
    if (hostServerMatch) {
        const {origin} = window.location
        const [, firstPart, appName] = hostServerMatch
        const appCodeUrl = `${origin}/${firstPart}${appName}/${appName}.js`
        const resourceUrl = `${origin}/${firstPart}${ASSET_DIR}`

        console.log('Loading app from', appCodeUrl, 'resource url', resourceUrl)
        return createElement(AppRunnerFromCodeUrl, {url: appCodeUrl, resourceUrl, appContext: getAppContext(resourceUrl)})
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
