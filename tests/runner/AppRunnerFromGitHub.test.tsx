/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromGitHub from '../../src/runner/AppRunnerFromGitHub'
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
        if (url.startsWith('https://api.github.com')) {
            return Promise.resolve({json: () => wait(10).then(() => ([
                        {sha: 'abc123'},
                        {sha: 'xyz123'},
                    ]
                ))})
        }
        if (url.startsWith('https://cdn.jsdelivr.net/gh/mickey')) {
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

const appRunnerFromGitHub = (username = 'mickey', repo = 'mouse') => createElement(AppRunnerFromGitHub, {username, repo, appContext})

let container: any, {click, elIn, enter, expectEl, renderThe} = container = testContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe} = container = testContainer())
    renderThe(appRunnerFromGitHub())
})

test('shows loading until app loads then shows app on page', async () => {
    expectEl(container.domContainer).toHaveTextContent('Loading...')
    await actWait(50)
    expectEl('FirstText').toHaveTextContent('From https://cdn.jsdelivr.net/gh/mickey/mouse@abc123/ElementoProject.json')
})

test('only fetches github and app source once for a url', async () => {
    await act( () => wait(50) )
    renderThe(appRunnerFromGitHub()) // second render
    await act( () => wait(50) )
    expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/repos/mickey/mouse/commits')
    expect(global.fetch).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mickey/mouse@abc123/ElementoProject.json')
    expect(global.fetch).toHaveBeenCalledTimes(2)
})

test('updates app source for a new url', async () => {
    await actWait(50)
    expectEl('FirstText').toHaveTextContent('From https://cdn.jsdelivr.net/gh/mickey/mouse@abc123/ElementoProject.json')
    expect(global.fetch).toHaveBeenCalledTimes(2)

    renderThe(appRunnerFromGitHub('mickey', 'mordor'))
    await actWait(50)
    expectEl('FirstText').toHaveTextContent('From https://cdn.jsdelivr.net/gh/mickey/mordor@abc123/ElementoProject.json')
    expect(global.fetch).toHaveBeenCalledTimes(4)
})

test('shows error if app source cannot be loaded', async () => {
    renderThe(appRunnerFromGitHub('manston', 'mordor'))
    await actWait(20)
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('URL https://cdn.jsdelivr.net/gh/manston/mordor@abc123/ElementoProject.json not found')
})

test('shows error if app source cannot be read', async () => {
    renderThe(appRunnerFromGitHub('mickey', 'badjson'))
    await actWait(50)
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('mickey/badjson')
    expectEl('errorMessage').toHaveTextContent('Not JSON')
})
test('shows error if app source contains an error', async () => {
    renderThe(appRunnerFromGitHub('mickey', 'badsource'))
    await actWait(50)
    expectEl('errorMessage').toHaveTextContent('Elemento was unable to load an app from this location:')
    expectEl('errorMessage').toHaveTextContent('Errors found in the app: { "text_1": { "content": "Unknown names: nowhere" } }')
})

