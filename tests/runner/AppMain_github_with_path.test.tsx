import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
/**
 * @vitest-environment jsdom
 */

import React, {createElement} from 'react'
import AppMain from '../../src/runner/AppMain'

import {actWait, testContainer} from '../testutil/rtlHelpers'
import {wait} from '../testutil/testHelpers'

vi.mock('../../src/runner/loadModuleHttp', ()=> ({
    loadModuleHttp: vi.fn().mockImplementation( async (url) => ({
        default: () => {
            return React.createElement('h1', {id: 'appone.mainpage.FirstText'},
                'App from GitHub with current url ' + window.location.origin + window.location.pathname)
        }
    }))
}))

let originalLocation: Location | null
beforeEach(() => {
    ({domContainer, click, elIn, enter, expectEl, renderThe, el} = container = testContainer())
})

afterEach(async () => {
    // @ts-ignore
    global.fetch = undefined
    if (originalLocation) {
        // @ts-ignore
        window.location = originalLocation
        originalLocation = null
    }

})

const appMain = (pathname: string, origin = 'https://example.com') => createElement(AppMain, {pathname, origin})

let container: any, {domContainer, click, elIn, enter, expectEl, renderThe, el} = container = {} as any

function mockFetchForGitHub() {
    return vi.fn().mockImplementation((urlArg: RequestInfo | URL) => {
        const url = urlArg.toString()
        if (url.startsWith('https://api.github.com')) {
            return Promise.resolve({json: () => wait(10).then(() => ([{sha: 'abc123'},]))})
        }
        return Promise.reject(new Error(`URL ${url} not found`))
    })
}

test('runs app from GitHub with path', async () => {
    // @ts-ignore
    global.fetch = mockFetchForGitHub()
    originalLocation = window.location
    // @ts-ignore
    delete window.location
    // @ts-ignore
    window.location = {
        origin: 'http://localhost',
        pathname: '/runner/gh/mongo/peewit/Page1/path2/1234',
        hash: '',
        search: ''
    } as Location
    renderThe(appMain('/runner/gh/mongo/peewit/Page1/path2/1234'))
    await actWait(50)
    expect(el`FirstText`).toHaveTextContent('App from GitHub with current url http://localhost/runner/gh/mongo/peewit/Page1/path2/1234')
})

