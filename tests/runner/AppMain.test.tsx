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
import {generate} from '../../src/generator/index'
import App from '../../src/model/App'

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
        const project = projectFixture3(url)
        const app = project.findChildElements(App)[0]
        const appCode = generate(app, project).code
        if (url.startsWith('https://api.github.com')) {
            return Promise.resolve({json: () => wait(10).then(() => ([{sha: 'abc123'},]))})
        }
        if (url.startsWith('https://cdn.jsdelivr.net/gh/')) {
            return Promise.resolve({text: () => {
                    return Promise.resolve().then(() => appCode)}})
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


