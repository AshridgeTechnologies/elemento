import React, {createElement} from 'react'
import {createRoot} from 'react-dom/client'
import AppRunnerFromUrl from './AppRunnerFromUrl'
import AppRunnerFromCode from './AppRunnerFromCode'
import {welcomeAppCode} from '../util/welcomeProject'
import AppRunnerForPreview from './AppRunnerForPreview'

type Properties = {windowUrlPath: string, windowUrlQuery: string}

export default function AppMain({windowUrlPath, windowUrlQuery}: Properties) {
    const path = windowUrlPath.substring(1)
    const query = windowUrlQuery.substring(1)
    const pathMatch = path.match(/https?:\/\/.+$/)
    if (pathMatch) {
        return createElement(AppRunnerFromUrl, {appCodeUrl: pathMatch[0]})
    } else if (query.includes('editorPreview')) {
        return createElement(AppRunnerForPreview, {})
    } else {
        return createElement(AppRunnerFromCode, {appCode: welcomeAppCode()})
    }
}

export const runAppFromWindowUrl = (windowUrlPath: string = location.pathname, windowUrlQuery: string = location.search, containerElementId: string = 'main') => {
    const container = document.createElement('div')
    container.id = containerElementId
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(React.createElement(AppMain, {windowUrlPath, windowUrlQuery}))
}