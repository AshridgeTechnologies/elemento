import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Generator from '../generator/Generator'
import TextElement from './TextElement'
import TextInput from './TextInput'
import NumberInput from './NumberInput'
import Button from './Button'
import ErrorFallback from './ErrorFallback'
import welcomeApp from '../util/welcomeApp'
import {loadJSONFromString} from '../model/loadJSON'
import {ErrorBoundary} from 'react-error-boundary'
import {globalFunctions as importedGlobalFunctions} from './globalFunctions'
import {getState, updateState, useObjectState, useObjectStateWithDefaults} from './appData'
import AppLoadError from './AppLoadError'

let theApp: App

declare global {
    var app: () => App
    var setApp: (app: App) => void
    var setAppFromJSONString: (appJson: string) => void

    var runApp: () => any
    var AppMain: () => any
    var globalFunctions: object
}

export function app() { return theApp }
export function setApp(app: App) {
    theApp = app
    runApp()
}
export function setAppFromJSONString(appJson: string) {
    setApp(loadJSONFromString(appJson) as App)
}

window.app = app
window.setApp = setApp
window.runApp = runApp
window.setAppFromJSONString = setAppFromJSONString
window.globalFunctions = importedGlobalFunctions

const appContainer = () => document.querySelector('#main')

async function loadApp() {
    const path = location.pathname.substring(1)
    if (path.startsWith('https://') || path.startsWith('http://') ) {
        const appUrl = path.replace(/www.dropbox.com/, 'dl.dropboxusercontent.com')
        try {
            const appData = await fetch(appUrl).then(resp => resp.text())
            theApp = loadJSONFromString(appData)
        } catch (error: any) {
            throw {appUrl, error}
        }
    } else {
        theApp = welcomeApp()
    }
}

function showError({appUrl, error}: {appUrl:string, error: Error}) {
    ReactDOM.render(React.createElement(AppLoadError, {appUrl, error}), appContainer())
}

function runApp() {
    const appMainCode = new Generator(theApp).outputFiles().map( f => f.content ).join('\n')

    const scriptElement = document.createElement('script')
    scriptElement.id = 'appMainCode'
    scriptElement.innerHTML = appMainCode

    document.getElementById('appMainCode')?.remove()
    document.body.append(scriptElement)

    ReactDOM.render(
        React.createElement(ErrorBoundary, {FallbackComponent: ErrorFallback},
            React.createElement(AppMain, null)
        ), appContainer()
    )
}

// @ts-ignore
window.Button = Button
// @ts-ignore
window.TextElement = TextElement
// @ts-ignore
window.TextInput = TextInput
// @ts-ignore
window.NumberInput = NumberInput
// @ts-ignore
window.useObjectState = useObjectState
// @ts-ignore
window.updateState = updateState
// @ts-ignore
window.getState = getState
// @ts-ignore
window.useObjectStateWithDefaults = useObjectStateWithDefaults


loadApp().then( runApp, showError )
