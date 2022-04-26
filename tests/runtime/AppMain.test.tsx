/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppMain from '../../src/runtime/AppMain'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {addContainer} from '../testutil/elementHelpers'
import {wait} from '../testutil/rtlHelpers'
import {appCode1} from '../testutil/projectFixtures'

import {getDownloadURL} from 'firebase/storage'

jest.mock('firebase/storage')

function mockDownloadURL(path: string) {
    const mock_getDownloadURL = getDownloadURL as jest.MockedFunction<any>
    mock_getDownloadURL.mockResolvedValue(`https://firebase.storage/${path}`)
}

beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((url) => Promise.resolve( {text: () => wait(10).then( () => appCode1(url) )}))
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

test('runs app from storage location at end of window location path', async () => {
    mockDownloadURL('apps/xxx222/myApp.js')
    renderIt(appMain('/runner/apps/xxx222/myApp.js'))
    await act(() => wait(20))
    expect(el`FirstText`).toHaveTextContent('This is App One from https://firebase.storage/apps/xxx222/myApp.js')
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

