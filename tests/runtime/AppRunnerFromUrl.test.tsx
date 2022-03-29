/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromUrl from '../../src/runtime/AppRunnerFromUrl'
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
    global.fetch = jest.fn((url) => url.includes('bad') ? Promise.reject(new Error(`URL ${url} not found`)) : Promise.resolve( {text: () => wait(10).then( () => appCode(url) )}))
})

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

const appRunnerFromUrl = (appCodeUrl: string = 'https://some.code/app.js') => createElement(AppRunnerFromUrl, {appCodeUrl})

let container: any, {click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer())
    renderIt(appRunnerFromUrl())
})

test('shows loading until app loads then shows app on page', async () => {
    expectEl(container.domContainer).toHaveTextContent('Loading...')
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://some.code/app.js')
})

test('only fetches app code once for a url', async () => {
    await act( () => wait(20) )
    renderIt(appRunnerFromUrl()) // second render
    await act( () => wait(20) )
    expect(global.fetch).toHaveBeenCalledTimes(1)
})

test('updates app code for a new url', async () => {
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://some.code/app.js')
    expect(global.fetch).toHaveBeenCalledTimes(1)

    renderThe(appRunnerFromUrl('https://other.code/app.js'))
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://other.code/app.js')
    expect(global.fetch).toHaveBeenCalledTimes(2)
})

test('shows error if code cannot be loaded', async () => {
    renderThe(appRunnerFromUrl('https://bad.url'))
    await act( () => wait(20) )
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this web location:')
    expectEl('errorMessage').toHaveTextContent('URL https://bad.url not found')

})

test('fixes dropbox url', async () => {
    renderThe(appRunnerFromUrl('https://www.dropbox.com/xyz123/app.js?abc=123'))
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://dl.dropboxusercontent.com/xyz123/app.js?abc=123')
})
