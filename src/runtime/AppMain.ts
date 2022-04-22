import React, {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import AppRunnerFromUrl from './AppRunnerFromUrl'
import AppRunnerFromCode from './AppRunnerFromCode'
import {welcomeAppCode} from '../util/welcomeProject'
import AppRunnerForPreview from './AppRunnerForPreview'

type Properties = {windowUrlPath: string}

export default function AppMain({windowUrlPath}: Properties) {
    const path = decodeURIComponent(windowUrlPath)
    const webMatch = path.match(/\/web\/(.+)$/)
    if (webMatch) {
        const appCodeUrl = `https://${webMatch[1]}`
        return createElement(AppRunnerFromUrl, {appCodeUrl})
    } else if (path.match(/\/editorPreview$/)) {
        return createElement(AppRunnerForPreview, {})
    } else {
        return createElement(AppRunnerFromCode, {appCode: welcomeAppCode()})
    }
}

export const runAppFromWindowUrl = (windowUrlPath: string = location.pathname, containerElementId: string = 'main') => {
    const container = document.createElement('div')
    container.id = containerElementId
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(React.createElement(AppMain, {windowUrlPath}))
}