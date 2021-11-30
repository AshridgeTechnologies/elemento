import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Generator from '../generator/Generator'
import TextElement from './TextElement'
import TextInput from './TextInput'
import ErrorFallback from './ErrorFallback'
import welcomeApp from '../util/welcomeApp'
import {loadJSONFromString} from '../model/loadJSON'
import {ErrorBoundary} from 'react-error-boundary'
import {globalFunctions as importedGlobalFunctions} from './globalFunctions'
import {useObjectState, updateState, getState, useObjectStateWithDefaults} from './appData'

let theApp = welcomeApp()

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

function runApp() {
    const appMainCode = new Generator(theApp).outputFiles().map( f => f.content ).join('\n')

    const domContainer = document.querySelector('#main');
    const scriptElement = document.createElement('script')
    scriptElement.id = 'appMainCode'
    scriptElement.innerHTML = appMainCode

    document.getElementById('appMainCode')?.remove()
    document.body.append(scriptElement)

    ReactDOM.render(
        React.createElement(ErrorBoundary, {FallbackComponent: ErrorFallback},
            React.createElement(AppMain, null)
        ), domContainer
    )
}

// @ts-ignore
window.TextElement = TextElement
// @ts-ignore
window.TextInput = TextInput
// @ts-ignore
window.useObjectState = useObjectState
// @ts-ignore
window.updateState = updateState
// @ts-ignore
window.getState = getState
// @ts-ignore
window.useObjectStateWithDefaults = useObjectStateWithDefaults

runApp()
