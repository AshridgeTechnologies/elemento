import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Editor from './Editor'

let theApp = new App('app1', 'New App', {}, [
    new Page('page1','Main Page', {}, [
        new Text('text1_1', 'Text 1', {contentExpr: '"Welcome to Elemento!"'}),
    ])
])

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
