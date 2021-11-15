import React from 'react'
import ReactDOM from 'react-dom'
import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Generator from '../generator/Generator'
import TextElement from './TextElement'

declare var AppMain: any
declare var appModel: App

appModel = new App('app1', 'Welcome to Elemento', {}, [
    new Page('page1','Main Page', {}, [
        new Text('text1_1', 'First Text', {contentExpr: '"Welcome to Elemento!"'}),
        new Text("text1_2", 'Second Text', {contentExpr: '"The future of low code pogramming"'}),
    ])
])

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
