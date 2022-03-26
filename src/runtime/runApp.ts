import React from 'react'
import ReactDOM from 'react-dom'
import * as components from './components'
import ErrorFallback from './ErrorFallback'
import {ErrorBoundary} from 'react-error-boundary'
import {globalFunctions as importedGlobalFunctions} from './globalFunctions'
import importedAppFunctions from './appFunctions'
import {useObjectStateWithDefaults} from './appData'
import AppLoadError from './AppLoadError'
import {codeGenerationError, highlightElement, showAppCode} from './runtimeFunctions'
import {welcomeAppCode} from '../util/welcomeProject'

let theAppCode: string

declare global {
    var Elemento: {globalFunctions: object, appFunctions: object,
        useObjectStateWithDefaults: (path: string, initialValuesAndDefaults: object) => void,
        codeGenerationError: (_expr: string, _err: string) => undefined
        components: object}
    var appCode: () => string
    var setAppCode: (appCode: string) => void
    var setAppEventListener: (eventType: string, callback: (ev: Event) => void) => void

    var runApp: () => any
    var AppMain: () => any
}

const appContainer = () => document.querySelector('#main')
let appEventListenerCallback: (ev: Event) => void
const appEventListener = (ev: Event) => appEventListenerCallback?.call(null, ev)

export function setAppCode(appCode: string) {
    setAppCodeElement(appCode)
    runApp()
}

export function setAppEventListener(eventType: string, callback: (ev: Event) => void) {
    appEventListenerCallback = callback
    appContainer()?.addEventListener(eventType, appEventListener, true)
}

window.runApp = runApp
window.setAppCode = setAppCode
window.setAppEventListener = setAppEventListener
window.Elemento = {globalFunctions: importedGlobalFunctions, appFunctions: importedAppFunctions,
                    useObjectStateWithDefaults, codeGenerationError, components}


async function loadApp() {
    let appCode: string
    const path = location.pathname.substring(1)
    const pathMatch = path.match(/https?:\/\/.+$/)
    if (pathMatch) {
        const appUrl = pathMatch[0].replace(/www.dropbox.com/, 'dl.dropboxusercontent.com')
        try {
            appCode = await fetch(appUrl).then(resp => resp.text())
            new Function(appCode)  // throws if not valid JS code
        } catch (error: any) {
            throw {appUrl, error}
        }
    } else {
        appCode = welcomeAppCode()
    }

    setAppCodeElement(appCode)
}

function showError({appUrl, error}: {appUrl:string, error: Error}) {
    ReactDOM.render(React.createElement(AppLoadError, {appUrl, error}), appContainer())
}

function setAppCodeElement(code: string) {
    theAppCode = code
    const scriptElement = document.createElement('script')
    scriptElement.id = 'appMainCode'
    scriptElement.innerHTML = theAppCode

    document.getElementById('appMainCode')?.remove()
    document.body.append(scriptElement)
}

function runApp() {
    ReactDOM.render(
        React.createElement(ErrorBoundary, {FallbackComponent: ErrorFallback, resetKeys:[theAppCode]},
            React.createElement(AppMain, null)
        ), appContainer()
    )
}

// @ts-ignore
window.showAppCode = showAppCode
// @ts-ignore
window.highlightElement = highlightElement

loadApp().then( runApp, showError )
