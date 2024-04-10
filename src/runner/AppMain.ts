import {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import {DefaultAppContext} from '../runtime/AppContext'
import AppRunnerFromGitHub from './AppRunnerFromGitHub'
import AppRunnerFromCodeUrl from './AppRunnerFromCodeUrl'
import {runPreview} from '../runtime/run'
import {ASSET_DIR} from '../shared/constants'

type Properties = {pathname: string, origin: string}

const getAppContext = (pathPrefix: string | null = null) => new DefaultAppContext(pathPrefix)

export default function AppMain({pathname, origin}: Properties) {
    const path = decodeURIComponent(pathname)

    const githubToolsMatch = path.match(/^(.*)\/gh\/([-\w]+)\/([-\w]+)\/tools\/([-\w]+)/)
    if (githubToolsMatch) {
        const [, firstPart, username, repo, appName] = githubToolsMatch
        const pathPrefix = `${firstPart}/gh/${username}/${repo}/tools/${appName}`
        return createElement(AppRunnerFromGitHub, {username, repo, appName, subPath: 'tools', appContext: getAppContext(pathPrefix)})
    }

    const githubMatch = path.match(/^(.*)\/gh\/([-\w]+)\/([-\w]+)\/([-\w]+)/)
    if (githubMatch) {
        const [, firstPart, username, repo, appName] = githubMatch
        const pathPrefix = `${firstPart}/gh/${username}/${repo}/${appName}`
        return createElement(AppRunnerFromGitHub, {username, repo, appName, appContext: getAppContext(pathPrefix)})
    }

    const localMatch = path.match(/^\/run\/local\/(opfs|disk)\/([-\w]+)\/([-\w]+)/)
    if (localMatch) {
        const [, area, projectName, appName] = localMatch
        const pathPrefix = `run/local/${area}/${projectName}/${appName}`
        const appCodeUrl = '/' + pathPrefix + '/' + appName + '.js'
        const resourceUrl = `/run/local/${area}/${projectName}/${ASSET_DIR}`

        console.log('Loading local app from', appCodeUrl, 'resource url', resourceUrl)
        return createElement(AppRunnerFromCodeUrl, {url: appCodeUrl, resourceUrl, appContext: getAppContext(pathPrefix)})
    }

    const hostServerMatch = path.match(/^\/([-\w]+)(\/)?/)
    if (hostServerMatch) {
        const [, appName] = hostServerMatch
        const appCodeUrl = `${origin}/${appName}/${appName}.js`
        const pathPrefix = appName
        const resourceUrl = `${origin}/${ASSET_DIR}`

        console.log('Loading app from', appCodeUrl, 'resource url', resourceUrl)
        return createElement(AppRunnerFromCodeUrl, {url: appCodeUrl, resourceUrl, appContext: getAppContext(pathPrefix)})
    }

    return createElement('h4', null, 'Sorry - we could not find the Elemento app you are trying to run from ', pathname)
}

export const runAppFromWindowUrl = (windowLocation: {origin: string, pathname: string} = window.location, containerElementId = 'main') => {
    const {origin, pathname} = windowLocation
    if (pathname.startsWith('/studio/preview')) {
        runPreview(pathname)
    } else {
        const container = document.createElement('div')
        container.id = containerElementId
        document.body.appendChild(container)
        const root = createRoot(container)
        root.render(createElement(AppMain, {pathname, origin}))
    }
}
