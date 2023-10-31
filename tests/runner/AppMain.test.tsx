/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppMain from '../../src/runner/AppMain'
import '@testing-library/jest-dom'
import {actWait, testContainer} from '../testutil/rtlHelpers'
import {wait} from '../testutil/testHelpers'
import {loadModuleHttp} from '../../src/runner/loadModuleHttp'

jest.mock('../../src/runner/loadModuleHttp', ()=> ({
    loadModuleHttp: jest.fn().mockResolvedValue({
        default: () => {
            return React.createElement('h1', {id: 'appone.mainpage.FirstText'}, 'Test App')
        }
    })
}))

beforeEach(() => {
    ({domContainer, click, elIn, enter, expectEl, renderThe, el} = container = testContainer())
    // @ts-ignore
    global.fetch = mockFetchForGitHub();
    (loadModuleHttp as jest.MockedFunction<any>).mockClear()
})

afterEach(async () => {
    // @ts-ignore
    global.fetch = undefined
})

const appMain = (pathname: string, origin = 'https://example.com') => createElement(AppMain, {pathname, origin})

let container: any, {domContainer, click, elIn, enter, expectEl, renderThe, el} = container = {} as any

function mockFetchForGitHub() {
    return jest.fn((urlArg: RequestInfo | URL) => {
        const url = urlArg.toString()
        if (url.startsWith('https://api.github.com')) {
            return Promise.resolve({json: () => wait(10).then(() => ([{sha: 'abc123'},]))})
        }
        return Promise.reject(new Error(`URL ${url} not found`))
    })
}

test('runs app from GitHub', async () => {
    renderThe(appMain('/runner/gh/mongo/peewit/AppOne'))
    await actWait(10)
    expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mongo/peewit@abc123/dist/client/AppOne/AppOne.js')
    expect(el`FirstText`).toHaveTextContent('Test App')
})

test('runs app from GitHub in sub-directory', async () => {
    renderThe(appMain('/runner/gh/mongo/peewit/dir1/dir2/AppOne'))
    await actWait(10)
    expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mongo/peewit@abc123/dir1/dir2/dist/client/AppOne/AppOne.js')
    expect(el`FirstText`).toHaveTextContent('Test App')
})

test('runs app from GitHub with non-standard chars', async () => {
    renderThe(appMain('/runner/gh/mongo-pongo/-beetle-juice-/AppOne'))
    await actWait(10)
    expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mongo-pongo/-beetle-juice-@abc123/dist/client/AppOne/AppOne.js')
    expect(el`FirstText`).toHaveTextContent('Test App')
})

test('runs app from host with path before app name', async () => {
    renderThe(appMain('/myhost/apps/AppOne'))
    await actWait(10)
    expect(loadModuleHttp).toHaveBeenCalledWith('https://example.com/myhost/apps/AppOne/AppOne.js')
    expect(el`FirstText`).toHaveTextContent('Test App')
})

test('runs app from host with no path before app name', async () => {
    renderThe(appMain('/AppOne'))
    await actWait(10)
    expect(loadModuleHttp).toHaveBeenCalledWith('https://example.com/AppOne/AppOne.js')
    expect(el`FirstText`).toHaveTextContent('Test App')
})

