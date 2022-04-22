/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppMain from '../../src/runtime/AppMain'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {addContainer} from '../testutil/elementHelpers'
import {wait} from '../testutil/rtlHelpers'

const appCode = (url: string) => `
import React from 'react'
import Elemento from 'elemento-runtime'

function MainPage(props) {
    const pathWith = (name) => props.path + '.' + name
    // const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    // @ts-ignore
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "This is App One from ${url}"),
    )
}

export default function AppOne(props) {

    const appPages = {MainPage}
    // const appState = Elemento.useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = {currentPage: 'MainPage'} //appState
    return React.createElement('div', {id: 'AppOne'},
        React.createElement(appPages[currentPage], {path: \`AppOne.\${currentPage}\`})
    )
}

`

beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((url) => Promise.resolve( {text: () => wait(10).then( () => appCode(url) )}))
})

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

const appMain = (windowUrlPath: string) => createElement(AppMain, {windowUrlPath})

let container: any, {domContainer, click, elIn, enter, expectEl, renderThe, renderIt, el} = container = {} as any
beforeEach(() => {
    ({domContainer, click, elIn, enter, expectEl, renderThe, renderIt, el} = container = addContainer())
})

test('runs app from url at end of window location path', async () => {
    renderIt(appMain('/runner/web/some.code/app.js'))
    await act(() => wait(20))
    expect(el`FirstText`).toHaveTextContent('This is App One from https://some.code/app.js')
})

test('runs app from encoded url at end of window location path', async () => {
    renderIt(appMain('/runner/web/some.code%2fapp.js'))
    await act(() => wait(20))
    expect(el`FirstText`).toHaveTextContent('This is App One from https://some.code/app.js')
})

test('runs in editor preview mode if path found', async () => {
    renderIt(appMain('/runner/editorPreview'))
    await act( () => wait(20) )
    expect(global.setAppCode).not.toBeUndefined()
})

test('shows welcome app if no url found', async () => {
    renderIt(appMain('/runner'))
    await act( () => wait(20) )
    expect(el`FirstText`).toHaveTextContent('Welcome to Elemento!')
})

