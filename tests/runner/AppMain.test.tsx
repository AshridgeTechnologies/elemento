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

let idSeq = 1
beforeEach(() => {
    ({domContainer, click, elIn, enter, expectEl, renderThe, el} = container = testContainer(null, 'container' + (idSeq++)))
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
        if (url.startsWith('https://cdn.jsdelivr.net')) {
            return Promise.resolve({text: () => wait(10).then(() => 'File text')})
        }
        return Promise.reject(new Error(`URL ${url} not found`))
    })
}

describe('GitHub', () => {

    test.each([
        '/runner/gh/mongo/peewit/AppOne',
        '/runner/gh/mongo/peewit/AppOne/',
        '/runner/gh/mongo/peewit/AppOne/Page1/stuff',
        '/runner/gh/mongo/peewit/AppOne/Page1/stuff/',
        ])
    ('runs app from GitHub', async (url) => {
        renderThe(appMain(url))
        await actWait(10)
        expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mongo/peewit@abc123/dist/client/AppOne/AppOne.js')
        expect(el`FirstText`).toHaveTextContent('Test App')
    })

    test('runs app from GitHub with non-standard chars', async () => {
        renderThe(appMain('/runner/gh/mongo-pongo/-beetle-juice-/AppOne'))
        await actWait(10)
        expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mongo-pongo/-beetle-juice-@abc123/dist/client/AppOne/AppOne.js')
        expect(el`FirstText`).toHaveTextContent('Test App')
    })
})

describe('GitHub tool', () => {

    test.each([
        '/runner/gh/mongo/peewit/tools/ToolOne',
        '/runner/gh/mongo/peewit/tools/ToolOne/',
        '/runner/gh/mongo/peewit/tools/ToolOne/Page1/stuff',
        '/runner/gh/mongo/peewit/tools/ToolOne/Page1/stuff/',
        ])
    ('runs tool from GitHub', async (url) => {
        renderThe(appMain(url))
        await actWait(10)
        expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mongo/peewit@abc123/dist/client/tools/ToolOne/ToolOne.js')
        expect(el`FirstText`).toHaveTextContent('Test App')
    })

    test('runs app from GitHub with non-standard chars', async () => {
        renderThe(appMain('/runner/gh/mongo-pongo/-beetle-juice-/tools/ToolOne'))
        await actWait(10)
        expect(loadModuleHttp).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/mongo-pongo/-beetle-juice-@abc123/dist/client/tools/ToolOne/ToolOne.js')
        expect(el`FirstText`).toHaveTextContent('Test App')
    })
})

describe('Local', () => {
    test.each([
        '/run/local/opfs/ProjectOne/AppOne',
        '/run/local/opfs/ProjectOne/AppOne/',
        '/run/local/opfs/ProjectOne/AppOne/PageOne/stuff',
        '/run/local/opfs/ProjectOne/AppOne/PageOne/stuff/',
    ])
    ('runs app from local', async (url) => {
        renderThe(appMain(url))
        await actWait(10)
        expect(loadModuleHttp).toHaveBeenCalledWith('/run/local/opfs/ProjectOne/AppOne/AppOne.js')
        expect(el`FirstText`).toHaveTextContent('Test App')
    })

    test('runs app from local with disk path', async () => {
        renderThe(appMain('/run/local/disk/Project Two/AppOne/PageOne/stuff'))
        await actWait(10)
        expect(loadModuleHttp).toHaveBeenCalledWith('/run/local/disk/Project Two/AppOne/AppOne.js')
        expect(el`FirstText`).toHaveTextContent('Test App')
    })
})

describe('Host', () => {
    test.each([
        '/AppOne',
        '/AppOne/',
        '/AppOne/PageOne/stuff',
        '/AppOne/PageOne/stuff/',
    ])('runs app from host', async (url) => {
        renderThe(appMain(url))
        await actWait(10)
        expect(loadModuleHttp).toHaveBeenCalledWith('https://example.com/AppOne/AppOne.js')
        expect(el`FirstText`).toHaveTextContent('Test App')
    })
})

