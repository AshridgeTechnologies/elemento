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
import {getTextFromStorage} from '../../src/shared/storage'

// Hack to get Jest 28 to work with ESM firebase
jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(),
}))
jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}))

jest.mock('../../src/shared/storage')

function mock_getTextFromStorage(path: string) {
    const mock_fn = getTextFromStorage as jest.MockedFunction<any>
    mock_fn.mockImplementation( () => wait(10).then(() => path.includes('bad') ? Promise.reject(new Error(`URL ${path} not found`)) : Promise.resolve(appCode1(path))))
}

beforeEach(() => {
    jest.resetAllMocks();
    ({domContainer, click, elIn, enter, expectEl, renderThe, renderIt, el} = container = addContainer())
    // @ts-ignore
    global.fetch = jest.fn((url) => Promise.resolve( {text: () => wait(10).then( () => appCode1(url) )}))
})

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

const appMain = (windowUrlPath: string) => createElement(AppMain, {windowUrlPath})

let container: any, {domContainer, click, elIn, enter, expectEl, renderThe, renderIt, el} = container = {} as any

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
    mock_getTextFromStorage('apps/xxx222/myApp.js')
    renderIt(appMain('/runner/apps/xxx222/myApp.js'))
    await act(() => wait(20))
    expect(el`FirstText`).toHaveTextContent('This is App One from apps/xxx222/myApp.js')
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

