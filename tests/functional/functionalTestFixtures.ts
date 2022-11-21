import App from '../../src/model/App'
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import Button from '../../src/model/Button'
import Project from '../../src/model/Project'
import {ex} from './playwrightHelpers.js'
import List from '../../src/model/List'
import Layout from '../../src/model/Layout'
import NumberInput from '../../src/model/NumberInput'
import Text from '../../src/model/Text'

type ElementType = {kind: string, id: string, name: string, properties?: object, elements?: ElementType[]}
export const el = (kind: string, id: string, name: string, properties: object = {}, elements: ElementType[] = []): ElementType => {
    return {id, name, kind, properties, elements}
}


export function projectFixture1() {

    const page1 = el('Page', 'page_1', 'Main Page', {}, [
        el('Text', 'text_1', 'First Text', {content: ex`"The first bit of text"`}),
        el('Text', 'text_2', 'Second Text', {content: ex`"The second bit of text"`}),
        el('Layout', 'layout_1', 'A Layout', {}, [
            el('NumberInput', 'numberInput_15', 'Nested Text', {}),
        ])
    ])
    const page2 = el('Page', 'page_2', 'Other Page', {}, [
        el('Text', 'text_3', 'Some Text', {content: ex`"Some text here"`}),
        el('Text', 'text_4', 'More Text', {content: ex`"...and more text"`}),
    ])
    const app = el('App', 'app1', 'App One', {}, [
        page1,
        page2
    ])
    return el('Project', 'project_1', 'Project One', {}, [app])
}

export function projectFixture2() {

    const page1 = el('Page', 'page_1', 'Main Page', {}, [
        el('Text', 'text_1', 'First Text', {content: ex`"Page One"`}),
        el('TextInput', 'textInput_1', 'First Text Input', {initialValue: ex`"A text value"`, maxLength: ex`30`}),
        el('Button', 'button_1', 'Button 1', {content: 'Go to Page 2', action: ex`ShowPage(OtherPage)`}),
    ])
    const page2 = el('Page', 'page_2', 'Other Page', {}, [
        el('Text', 'text_3', 'Some Text', {content: ex`"Page Two"`}),
        el('TextInput', 'textInput_2', 'Another Text Input', {initialValue: ex`"Type the text"`, maxLength: ex`50`}),
        el('Button', 'button_2', 'Button 2', {content: 'Back to Page 1', action: ex`ShowPage(MainPage)`}),
    ])
    const app = el('App', 'app1', 'App One', {}, [
        page1,
        page2
    ])
    return el('Project', 'project_1', 'Project One', {}, [app])
}

export function projectFixtureWithList() {
    const page1 = el('Page', 'p1', 'Page 1', {}, [
            el('List', 'l1', 'List 1', {items: [{color: 'green'}, {color: 'red'}, {color: 'blue'}]}, [
                el('Text', 'id1', 'Text 1', {content: 'Hi there!'}),
                el('Text', 'id2', 'Text 2', {content: ex`"This is " + Left($item.color, 3)`}),
            ])
        ]
    )
    const app = el('App', 't1', 'App 1', {}, [
        page1,
    ])

    return el('Project', 'project_1', 'Project One', {}, [app])
}

export function welcomeProject() {
    return el('Project', 'project_1', 'Welcome to Elemento', {}, [
        el('App', 'app1', 'Welcome App', {}, [
            el('Page', 'page_1', 'Main Page', {}, [
                el('Text', 'text1_1', 'First Text', {content: {'expr': '"Welcome to Elemento!"'}}),
                el('Text', 'text1_2', 'Second Text', {content: {'expr': '"The future of low code programming"'}}),
            ])
        ])])

}

export const appCode1 = (url: string) => `
import React from 'react'
import Elemento from 'elemento-runtime'

function MainPage(props) {
    const pathWith = (name) => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "This is App One from ${url}"),
    )
}

export default function AppOne(props) {

    const pages = {MainPage}
    const {App} = Elemento.components
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'AppOne'})
}

`
