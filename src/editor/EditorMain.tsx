import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Editor from './Editor'
import welcomeApp from '../util/welcomeApp'

let theApp = welcomeApp()

export function app() { return theApp }
export function setApp(app: App) {
    theApp = app
    doRender()
}

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
