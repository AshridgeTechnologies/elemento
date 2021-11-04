import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Editor from './Editor'

let theApp = new App('app1', 'App One', {}, [
    new Page('page1','Main Page', {}, [
        new Text('text1_1', 'First Text', {contentExpr: '"The first bit of text"'}),
        new Text("text1_2", 'Second Text', {contentExpr: '"The second bit of text"'}),
    ]),
    new Page('page2','Other Page', {}, [
        new Text("text2_1", 'Some Text', {contentExpr: '"Some text here"'}),
        new Text("text2_2", 'More Text', {contentExpr: '"...and more text"'}),
    ])
])

export function app() { return theApp }

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
