import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Generator from '../generator/Generator'
import TextElement from './TextElement'
import welcomeApp from '../util/welcomeApp'

declare var AppMain: any
declare var appModel: App

appModel = welcomeApp()

function runApp(appModel: App) {
    const appMainCode = new Generator(appModel).outputFiles()[0].content

    const domContainer = document.querySelector('#main');
    const scriptElement = document.createElement('script')
    scriptElement.id = 'appMainCode'
    scriptElement.innerHTML = appMainCode

    document.getElementById('appMainCode')?.remove()
    document.body.append(scriptElement)

    ReactDOM.render(React.createElement(AppMain, null), domContainer);
}

// @ts-ignore
window.TextElement = TextElement
// @ts-ignore
window.runApp = runApp
// @ts-ignore
runApp(appModel)
