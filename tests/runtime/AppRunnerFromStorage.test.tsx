/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromStorage from '../../src/runtime/AppRunnerFromStorage'
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

function mockDownloadURLError(path: string) {
    const mock_getDownloadURL = getDownloadURL as jest.MockedFunction<any>
    mock_getDownloadURL.mockRejectedValueOnce(new Error(`Not found: https://firebase.storage/${path}`))
}

beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((url) => url.includes('bad') ? Promise.reject(new Error(`URL ${url} not found`)) : Promise.resolve( {text: () => wait(10).then( () => appCode1(url) )}))
})

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

const appRunnerFromStorage = (appCodePath: string = 'apps/xxx222/app.js') => createElement(AppRunnerFromStorage, {appCodePath})

let container: any, {click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer())
    mockDownloadURL('apps/xxx222/app.js')
    renderIt(appRunnerFromStorage())
})

test('shows loading until app loads then shows app on page', async () => {
    expectEl(container.domContainer).toHaveTextContent('Loading...')
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://firebase.storage/apps/xxx222/app.js')
})

test('only fetches app code once for a url', async () => {
    await act( () => wait(20) )
    renderIt(appRunnerFromStorage()) // second render
    await act( () => wait(20) )
    expect(global.fetch).toHaveBeenCalledTimes(1)
})

test('updates app code for a new url', async () => {
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://firebase.storage/apps/xxx222/app.js')
    expect(global.fetch).toHaveBeenCalledTimes(1)

    mockDownloadURL('apps/xxx222/otherApp.js')
    renderThe(appRunnerFromStorage('apps/xxx222/otherApp.js'))
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://firebase.storage/apps/xxx222/otherApp.js')
    expect(global.fetch).toHaveBeenCalledTimes(2)
})

test('shows error if code cannot be loaded', async () => {
    mockDownloadURLError('apps/xxx222/badApp.js')
    renderThe(appRunnerFromStorage('apps/xxx222/badapp.js'))
    await act( () => wait(20) )
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('Not found: https://firebase.storage/apps/xxx222/badApp.js')
})
