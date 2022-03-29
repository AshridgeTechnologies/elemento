import React from 'react'
import Elemento from 'elemento-runtime'

// MainPage.js
function MainPage(props) {
    const pathWith = name => props.path + '.' + name
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "This is App One"),
        React.createElement(TextElement, {path: pathWith('SecondText')}, "The second bit of text"),
    )
}

// OtherPage.js
function OtherPage(props) {
    const pathWith = name => props.path + '.' + name
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('SomeText')}, "Some text here"),
        React.createElement(TextElement, {path: pathWith('MoreText')}, "...and more text"),
    )
}

// appMain.js
export default function AppMain(props) {

    const appPages = {MainPage, OtherPage}
    const appState = Elemento.useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = appState
    return React.createElement('div', {id: 'AppOne'},
        React.createElement(appPages[currentPage], {path: `AppOne.${currentPage}`})
    )
}
