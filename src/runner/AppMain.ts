import {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import {DefaultAppContext} from '../runtime/AppContext'
import AppRunnerFromGitHub from './AppRunnerFromGitHub'
import AppRunnerFromCodeUrl from './AppRunnerFromCodeUrl'
import {runForDev} from '../runtime/run'
import {ASSET_DIR} from '../shared/constants'

type Properties = {pathname: string, origin: string}

const getAppContext = (pathPrefix: string | null = null) => new DefaultAppContext(pathPrefix)

export default function AppMain({pathname, origin}: Properties) {
    const path = decodeURIComponent(pathname)

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
        const [, firstPart = '', appName] = hostServerMatch
        const appCodeUrl = `${origin}/${firstPart}${appName}/${appName}.js`
        const pathPrefix = `${firstPart}${appName}`
        const resourceUrl = `${origin}/${firstPart}${ASSET_DIR}`

        console.log('Loading app from', appCodeUrl, 'resource url', resourceUrl)
        return createElement(AppRunnerFromCodeUrl, {url: appCodeUrl, resourceUrl, appContext: getAppContext(pathPrefix)})
    }

    return createElement('h4', null, 'Sorry - we could not find the Elemento app you are trying to run from ', pathname)
}

export const runAppFromWindowUrl = (windowLocation: {origin: string, pathname: string} = window.location, containerElementId = 'main') => {
    const {origin, pathname} = windowLocation
    if (pathname.startsWith('/studio/preview')) {
        runForDev(pathname)
    } else {
        const container = document.createElement('div')
        container.id = containerElementId
        document.body.appendChild(container)
        const root = createRoot(container)
        root.render(createElement(AppMain, {pathname, origin}))
    }
}
