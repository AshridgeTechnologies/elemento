/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromGitHub from '../../src/runner/AppRunnerFromGitHub'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {actWait, testContainer} from '../testutil/rtlHelpers'
import {projectFixture3} from '../testutil/projectFixtures'
import AppContext, {UrlType} from '../../src/runtime/AppContext'
import {wait} from '../testutil/testHelpers'
import App from '../../src/model/App'
import {generate} from '../../src/generator/index'
import {loadModuleHttp} from '../../src/runner/loadModuleHttp'

jest.mock('../../src/runner/loadModuleHttp', ()=> ({
    loadModuleHttp: jest.fn().mockResolvedValue({
        default: () => {
            return React.createElement('h1', {id: 'appone.mainpage.FirstText'}, 'App from GitHub')
        }
    })
}))

function mockFetchForGitHub() {
    return jest.fn((urlArg: RequestInfo | URL) => {
        const url = urlArg.toString()
        if (url.startsWith('https://api.github.com')) {
            return Promise.resolve({json: () => wait(10).then(() => ([{sha: 'abc123'},]))})
        }
        return Promise.reject(new Error(`URL ${url} not found`))
    })
}
beforeEach(() => {
    // @ts-ignore
    global.fetch = mockFetchForGitHub()
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

const appRunnerFromGitHub = (username = 'mickey', repo = 'mouse', appName = 'AppOne') => createElement(AppRunnerFromGitHub, {username, repo, appName, appContext})

let container: any, {click, elIn, enter, expectEl, renderThe} = container = testContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe} = container = testContainer())

    renderThe(appRunnerFromGitHub())
})

test('shows loading until app loads then shows app on page', async () => {
    expectEl(container.domContainer).toHaveTextContent('Finding latest version...')
    await actWait(500)
    expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mickey/mouse@abc123/dist/client/AppOne.js')
    expectEl('FirstText').toHaveTextContent('App from GitHub')
})

test('only fetches github commits once for a url', async () => {
    await act( () => wait(50) )
    renderThe(appRunnerFromGitHub()) // second render
    await act( () => wait(50) )
    expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/repos/mickey/mouse/commits')
    expect(global.fetch).toHaveBeenCalledTimes(1)
})
