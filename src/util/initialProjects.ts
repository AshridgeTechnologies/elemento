import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Project from '../model/Project'

export function editorInitialProject() {
    return new Project('project_1', 'Welcome to Elemento', {}, [
        new App('app1', 'Welcome to Elemento', {}, [
            new Page('page_1', 'Main Page', {}, [
                new Text('text1_1', 'First Text', {content: {'expr': '"Welcome to Elemento!"'}}),
                new Text('text1_2', 'Second Text', {content: {'expr': '"The future of low code programming"'}}),
                new Text('text1_3', 'Third Text', {content: {'expr': '"Start your program here..."'}}),
            ])
        ])])
}

export function editorEmptyProject() {
    return new Project('project_1', 'New Project', {}, [
        new App('app1', 'New App', {}, [
            new Page('page_1', 'Main Page', {}, [])
        ])])
}

export const welcomeAppCode = () => `
import React from 'react'
import Elemento from 'elemento-runtime'

function MainPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "Welcome to Elemento!"),
        React.createElement(TextElement, {path: pathWith('SecondText')}, "The future of low code programming"),
    )
}

export default function WelcomeApp(props) {
    const pages = {MainPage}
    const {App} = Elemento.components
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'WelcometoElemento'})

}
`
