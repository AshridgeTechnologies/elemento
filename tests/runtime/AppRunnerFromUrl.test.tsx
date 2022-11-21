/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromUrl from '../../src/runtime/AppRunnerFromUrl'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {addContainer} from '../testutil/elementHelpers'
import {wait} from '../testutil/rtlHelpers'
import {appCode1} from '../testutil/projectFixtures'
import AppContext, {UrlType} from '../../src/runtime/AppContext'

beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((url) => url.includes('bad') ? Promise.reject(new Error(`URL ${url} not found`)) : Promise.resolve( {text: () => wait(10).then( () => appCode1(url) )}))
})

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

const appContext: AppContext = {
    getUrl(): UrlType { return {location: {origin: 'http://foo.com', pathname: '/MainPage/xyz', query: {a: '10'}, hash: 'mark1'}, pathPrefix: 'pp'}},
    updateUrl(path: string, query: object, anchor: string): void {},
    onUrlChange: jest.fn(),
    goBack(): void {}
}

const appRunnerFromUrl = (appCodeUrl: string = 'https://some.code/app.js') => createElement(AppRunnerFromUrl, {appCodeUrl, appContext})

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
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('URL https://bad.url not found')
})

test('fixes dropbox url', async () => {
    renderThe(appRunnerFromUrl('https://www.dropbox.com/xyz123/app.js?abc=123'))
    await act( () => wait(20) )
    expectEl('FirstText').toHaveTextContent('This is App One from https://dl.dropboxusercontent.com/xyz123/app.js?abc=123')
})
