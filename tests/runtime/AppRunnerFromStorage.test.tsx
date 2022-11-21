/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromStorage from '../../src/runtime/AppRunnerFromStorage'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {addContainer} from '../testutil/elementHelpers'
import {wait} from '../testutil/rtlHelpers'

import {getTextFromStorage} from '../../src/shared/storage'
import {appCode1} from '../testutil/projectFixtures'
import AppContext, {UrlType} from '../../src/runtime/AppContext'

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(),
}))
jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}))

jest.mock('../../src/shared/storage')

export function mock_getTextFromStorage(path: string) {
    const mock_fn = getTextFromStorage as jest.MockedFunction<any>
    mock_fn.mockImplementation( () => wait(10).then(() => path.includes('bad') ? Promise.reject(new Error(`URL ${path} not found`)) : Promise.resolve(appCode1(path))))
}

const appContext: AppContext = {
    getUrl(): UrlType { return {location: {origin: 'http://foo.com', pathname: '/MainPage/xyz', query: {a: '10'}, hash: 'mark1'}, pathPrefix: 'pp'}},
    updateUrl(path: string, query: object, anchor: string): void {},
    onUrlChange: jest.fn(),
    goBack(): void {}
}

const appRunnerFromStorage = (appCodePath: string = 'apps/xxx222/app.js') => createElement(AppRunnerFromStorage, {appCodePath, appContext})

let container: any, {click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer()
beforeEach(() => {
    jest.resetAllMocks();
    ({click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer())
    mock_getTextFromStorage('apps/xxx222/app.js')
    renderIt(appRunnerFromStorage())
})

test('shows loading until app loads then shows app on page', async () => {
    expectEl(container.domContainer).toHaveTextContent('Loading...')
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from apps/xxx222/app.js')
})

test('only fetches app code once for a url', async () => {
    await act( () => wait(20) )
    renderIt(appRunnerFromStorage()) // second render
    await act( () => wait(20) )
    expect(getTextFromStorage).toHaveBeenCalledTimes(1)
})

test('updates app code for a new url', async () => {
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from apps/xxx222/app.js')
    expect(getTextFromStorage).toHaveBeenCalledTimes(1)

    mock_getTextFromStorage('apps/xxx222/otherApp.js')
    renderThe(appRunnerFromStorage('apps/xxx222/otherApp.js'))
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from apps/xxx222/otherApp.js')
    expect(getTextFromStorage).toHaveBeenCalledTimes(2)
})

test('shows error if code cannot be loaded', async () => {
    mock_getTextFromStorage('apps/xxx222/badApp.js')
    renderThe(appRunnerFromStorage('apps/xxx222/badapp.js'))
    await act( () => wait(20) )
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('URL apps/xxx222/badApp.js not found')
})
