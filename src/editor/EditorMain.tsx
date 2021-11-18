import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Editor from './Editor'
import {editorInitialApp} from '../util/welcomeApp'
import {loadJSONFromString} from '../model/loadJSON'

let theApp = editorInitialApp()

declare global {
    var app: () => App
    var setApp: (app: App) => void
    var setAppFromJSONString: (appJson: string) => void
}
export function app() { return theApp }
export function setApp(app: App) {
    theApp = app
    doRender()
}
export function setAppFromJSONString(appJson: string) {
    setApp(loadJSONFromString(appJson) as App)
}

window.app = app
window.setApp = setApp
window.setAppFromJSONString = setAppFromJSONString

const onPropertyChange = (id: string, propertyName: string, value: any)=> {
    //console.log(id, propertyName, value)
    theApp = theApp.set(id, propertyName, value)
    doRender()
}

function doRender() {
    ReactDOM.render(
        <Editor app={theApp} onChange={onPropertyChange}/>, document.getElementById('main')
    )
}

doRender()
