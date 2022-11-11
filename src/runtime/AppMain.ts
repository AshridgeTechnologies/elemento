import React, {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import AppRunnerFromUrl from './AppRunnerFromUrl'
import AppRunnerFromCode from './AppRunnerFromCode'
import {welcomeAppCode} from '../util/initialProjects'
import AppRunnerForPreview from './AppRunnerForPreview'
import AppRunnerFromStorage from './AppRunnerFromStorage'
import {DefaultAppContext} from './AppContext'

type Properties = {windowUrlPath: string}

const getAppContext = () => new DefaultAppContext(null)

export default function AppMain({windowUrlPath}: Properties) {
    const path = decodeURIComponent(windowUrlPath)
    const webMatch = path.match(/\/web\/(.+)$/)
    const appsMatch = path.match(/\/(apps\/.+)$/)
    if (webMatch) {
        const appCodeUrl = `https://${webMatch[1]}`
        return createElement(AppRunnerFromUrl, {appCodeUrl, appContext: getAppContext()})
    } else if (appsMatch) {
        const appCodePath = appsMatch[1]
        return createElement(AppRunnerFromStorage, {appCodePath, appContext: getAppContext()})
    } else if (path.match(/\/editorPreview$/)) {
        return createElement(AppRunnerForPreview, {pathPrefix: path})
    } else {
        return createElement(AppRunnerFromCode, {appCode: welcomeAppCode(), appContext: getAppContext()})
    }
}

export const runAppFromWindowUrl = (windowUrlPath: string = location.pathname, containerElementId = 'main') => {
    const container = document.createElement('div')
    container.id = containerElementId
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(React.createElement(AppMain, {windowUrlPath}))
}