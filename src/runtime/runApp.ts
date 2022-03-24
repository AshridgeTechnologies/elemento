import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Generator from '../generator/Generator'
import TextElement from './TextElement'
import TextInput from './TextInput'
import NumberInput from './NumberInput'
import SelectInput from './SelectInput'
import TrueFalseInput from './TrueFalseInput'
import Page from './Page'
import Button from './Button'
import Data from './Data'
import ErrorFallback from './ErrorFallback'
import {loadJSONFromString} from '../model/loadJSON'
import {ErrorBoundary} from 'react-error-boundary'
import {globalFunctions as importedGlobalFunctions} from './globalFunctions'
import importedAppFunctions from './appFunctions'
import {getState, updateState, useObjectState, useObjectStateWithDefaults} from './appData'
import AppLoadError from './AppLoadError'
import {codeGenerationError, showAppCode, highlightElement} from './runtimeFunctions'
import welcomeProject from '../util/welcomeProject'

let theApp: App

declare global {
    var app: () => App
    var setApp: (app: App) => void
    var setAppFromJSONString: (appJson: string) => void
    var setAppEventListener: (eventType: string, callback: (ev: Event) => void) => void

    var runApp: () => any
    var AppMain: () => any
    var globalFunctions: object
    var appFunctions: object
    var appCode: string
}

const appContainer = () => document.querySelector('#main')
let appEventListenerCallback: (ev: Event) => void
const appEventListener = (ev: Event) => appEventListenerCallback?.call(null, ev)

export function app() { return theApp }
export function setApp(app: App) {
    theApp = app
    runApp()
}
export function setAppFromJSONString(appJson: string) {
    setApp(loadJSONFromString(appJson) as App)
}
export function setAppEventListener(eventType: string, callback: (ev: Event) => void) {
    appEventListenerCallback = callback
    appContainer()?.addEventListener(eventType, appEventListener, true)
}

window.app = app
window.setApp = setApp
window.runApp = runApp
window.setAppFromJSONString = setAppFromJSONString
window.setAppEventListener = setAppEventListener
window.globalFunctions = importedGlobalFunctions
window.appFunctions = importedAppFunctions


async function loadApp() {
    const path = location.pathname.substring(1)
    const pathMatch = path.match(/https?:\/\/.+$/)
    if (pathMatch) {
        const appUrl = pathMatch[0].replace(/www.dropbox.com/, 'dl.dropboxusercontent.com')
        try {
            const appData = await fetch(appUrl).then(resp => resp.text())
            theApp = loadJSONFromString(appData)
        } catch (error: any) {
            throw {appUrl, error}
        }
    } else {
        theApp = welcomeProject().elementArray()[0] as App
    }
}

function showError({appUrl, error}: {appUrl:string, error: Error}) {
    ReactDOM.render(React.createElement(AppLoadError, {appUrl, error}), appContainer())
}


function runApp() {
    const appMainCode = new Generator(theApp).output().files.map( f => f.content ).join('\n')

    const scriptElement = document.createElement('script')
    scriptElement.id = 'appMainCode'
    scriptElement.innerHTML = appMainCode
    window.appCode = appMainCode

    document.getElementById('appMainCode')?.remove()
    document.body.append(scriptElement)

    ReactDOM.render(
        React.createElement(ErrorBoundary, {FallbackComponent: ErrorFallback, resetKeys:[appMainCode]},
            React.createElement(AppMain, null)
        ), appContainer()
    )
}

// @ts-ignore
window.Page = Page
// @ts-ignore
window.Button = Button
// @ts-ignore
window.TextElement = TextElement
// @ts-ignore
window.TextInput = TextInput
// @ts-ignore
window.NumberInput = NumberInput
// @ts-ignore
window.SelectInput = SelectInput
// @ts-ignore
window.TrueFalseInput = TrueFalseInput
// @ts-ignore
window.Data = Data
// @ts-ignore
window.useObjectState = useObjectState
// @ts-ignore
window.updateState = updateState
// @ts-ignore
window.getState = getState
// @ts-ignore
window.useObjectStateWithDefaults = useObjectStateWithDefaults
// @ts-ignore
window.codeGenerationError = codeGenerationError
// @ts-ignore
window.showAppCode = showAppCode
// @ts-ignore
window.highlightElement = highlightElement

loadApp().then( runApp, showError )
