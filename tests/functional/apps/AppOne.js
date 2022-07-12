import React from 'react'
import Elemento from 'elemento-runtime'

// MainPage.js
function MainPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "This is App One"),
        React.createElement(TextElement, {path: pathWith('SecondText')}, "The second bit of text"),
    )
}

// OtherPage.js
function OtherPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('SomeText')}, "Some text here"),
        React.createElement(TextElement, {path: pathWith('MoreText')}, "...and more text"),
    )
}

// appMain.js
export default function AppOne(props) {
    const pathWith = name => 'AppOne' + '.' + name
    const {App} = Elemento.components
    const pages = {MainPage, OtherPage}
    const app = Elemento.useObjectState('app', new App.State({pages}))

    return React.createElement(App, {path: 'AppOne', },)
}