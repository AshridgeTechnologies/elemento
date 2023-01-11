/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromSource from '../../src/runner/AppRunnerFromSource'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {actWait, testContainer} from '../testutil/rtlHelpers'
import {projectFixture3, projectFixtureWithError} from '../testutil/projectFixtures'
import AppContext, {UrlType} from '../../src/runtime/AppContext'
import {asJSON, wait} from '../testutil/testHelpers'

beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((urlArg: URL) => {
        const url = urlArg.toString()
        if (url.startsWith('https://myappstore.com/m')) {
            if (url.includes('badjson')) return Promise.resolve({json: () => wait(10).then(() => {throw new Error('Not JSON')})})
            if (url.includes('badsource')) return Promise.resolve({json: () => wait(10).then(() => asJSON(projectFixtureWithError()))})
            return Promise.resolve({json: () => wait(10).then(() => asJSON(projectFixture3(url)))})
        }
        return Promise.reject(new Error(`URL ${url} not found`))
    })
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

const appRunnerFromSource = (path = 'mickey') => createElement(AppRunnerFromSource, {url: `https://myappstore.com/${path}`, appContext})

let container: any, {click, elIn, enter, expectEl, renderThe} = container = testContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe} = container = testContainer())
    renderThe(appRunnerFromSource())
})

test('shows loading until app loads then shows app on page', async () => {
    expectEl(container.domContainer).toHaveTextContent('Loading...')
    await actWait(50)
    expectEl('FirstText').toHaveTextContent('From https://myappstore.com/mickey/ElementoProject.json')
})

test('only fetches github and app source once for a url', async () => {
    await act( () => wait(50) )
    renderThe(appRunnerFromSource()) // second render
    await act( () => wait(50) )
    expect(global.fetch).toHaveBeenCalledWith('https://myappstore.com/mickey/ElementoProject.json')
    expect(global.fetch).toHaveBeenCalledTimes(1)
})

test('updates app source for a new url', async () => {
    await actWait(50)
    expectEl('FirstText').toHaveTextContent('From https://myappstore.com/mickey/ElementoProject.json')
    expect(global.fetch).toHaveBeenCalledTimes(1)

    renderThe(appRunnerFromSource('mordor'))
    await actWait(50)
    expectEl('FirstText').toHaveTextContent('From https://myappstore.com/mordor/ElementoProject.json')
    expect(global.fetch).toHaveBeenCalledTimes(2)
})

test('shows error if app source cannot be loaded', async () => {
    renderThe(appRunnerFromSource('notThere'))
    await actWait(20)
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('URL https://myappstore.com/notThere/ElementoProject.json not found')
})

test('shows error if app source cannot be read', async () => {
    renderThe(appRunnerFromSource('mickey_badjson'))
    await actWait(50)
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('mickey_badjson')
    expectEl('errorMessage').toHaveTextContent('Not JSON')
})
test('shows error if app source contains an error', async () => {
    renderThe(appRunnerFromSource('mickey_badsource'))
    await actWait(50)
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('Errors found in the app: { "text_1": { "content": "Unknown names: nowhere" } }')
})

