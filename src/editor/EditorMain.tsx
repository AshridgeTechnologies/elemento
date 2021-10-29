import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App.js'
import Page from '../model/Page.js'
import Text from '../model/Text.js'
import Editor from './Editor.js'

let theApp = new App('app1', 'App One', [
    new Page('page1','Main Page', [
        new Text('text1_1', 'First Text', '"The first bit of text"'),
        new Text("text1_2", 'Second Text', '"The second bit of text"'),
    ]),
    new Page('page2','Other Page', [
        new Text("text2_1", 'Some Text', '"Some text here"'),
        new Text("text2_2", 'More Text', '"...and more text"'),
    ])
])

function doRender() {
    ReactDOM.render(
        <Editor app={theApp}/>,
        document.getElementById('main')
    )
}

doRender()
