/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppMain from '../../src/runner/AppMain'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {actWait, testContainer} from '../testutil/rtlHelpers'
import {appCode1, projectFixture3, projectFixtureWithError} from '../testutil/projectFixtures'
import {getTextFromStorage} from '../../src/shared/storage'
import {asJSON, wait} from '../testutil/testHelpers'

jest.mock('../../src/shared/storage')

function mock_getTextFromStorage(path: string) {
    const mock_fn = getTextFromStorage as jest.MockedFunction<any>
    mock_fn.mockImplementation( () => wait(10).then(() => path.includes('bad') ? Promise.reject(new Error(`URL ${path} not found`)) : Promise.resolve(appCode1(path))))
}

beforeEach(() => {
    jest.resetAllMocks();
    ({domContainer, click, elIn, enter, expectEl, renderThe, el} = container = testContainer())
    // @ts-ignore
    global.fetch = jest.fn((url) => Promise.resolve( {text: () => wait(10).then( () => appCode1(url) )}))
})

afterEach(async () => {
    // @ts-ignore
    global.fetch = undefined
})

const appMain = (windowUrlPath: string) => createElement(AppMain, {windowUrlPath})

let container: any, {domContainer, click, elIn, enter, expectEl, renderThe, el} = container = {} as any

function mockFetchForGitHub() {
    return jest.fn((urlArg: RequestInfo | URL) => {
        const url = urlArg.toString()
        if (url.startsWith('https://api.github.com')) {
            return Promise.resolve({json: () => wait(10).then(() => ([{sha: 'abc123'},]))})
        }
        if (url.startsWith('https://cdn.jsdelivr.net/gh/')) {
            return Promise.resolve({json: () => Promise.resolve().then(() => asJSON(projectFixture3(url)))})
        }
        return Promise.reject(new Error(`URL ${url} not found`))
    })
}

test('runs app from GitHub', async () => {
    // @ts-ignore
    global.fetch = mockFetchForGitHub()

    renderThe(appMain('/runner/gh/mongo/peewit'))
    await actWait(50)
    expect(el`FirstText`).toHaveTextContent('From https://cdn.jsdelivr.net/gh/mongo/peewit@abc123/ElementoProject.json')
    expect(el`PathSections`).toBeEmptyDOMElement()
})

test('runs app from GitHub with non-standard chars', async () => {
    // @ts-ignore
    global.fetch = mockFetchForGitHub()

    renderThe(appMain('/runner/gh/mongo-pongo/-beetle-juice-'))
    await actWait(50)
    expect(el`FirstText`).toHaveTextContent('From https://cdn.jsdelivr.net/gh/mongo-pongo/-beetle-juice-@abc123/ElementoProject.json')
    expect(el`PathSections`).toBeEmptyDOMElement()
})

test('runs app from url at end of window location path', async () => {
    renderThe(appMain('/runner/web/some.code/app.js'))
    await actWait(20)
    expect(el`FirstText`).toHaveTextContent('This is App One from https://some.code/app.js')
})

test('runs app from encoded url at end of window location path', async () => {
    renderThe(appMain('/runner/web/some.code%2fapp.js'))
    await actWait(20)
    expect(el`FirstText`).toHaveTextContent('This is App One from https://some.code/app.js')
})

test('runs app from storage location at end of window location path', async () => {
    mock_getTextFromStorage('apps/xxx222/myApp.js')
    renderThe(appMain('/runner/apps/xxx222/myApp.js'))
    await actWait(20)
    expect(el`FirstText`).toHaveTextContent('This is App One from apps/xxx222/myApp.js')
})

test('shows welcome app if no url found', async () => {
    renderThe(appMain('/runner'))
    await act( () => wait(20) )
    expect(el`FirstText`).toHaveTextContent('Welcome to Elemento!')
})

