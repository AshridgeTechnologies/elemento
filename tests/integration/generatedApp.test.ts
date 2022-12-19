/**
 * @jest-environment jsdom
 */

import Text from '../../src/model/Text'
import App from '../../src/model/App'
import {generate} from '../../src/generator/Generator'
import Page from '../../src/model/Page'
import {ex, wait} from '../testutil/testHelpers'
import {runAppFromWindowUrl} from '../../src/runner/AppMain'
import '@testing-library/jest-dom'
import {act} from '@testing-library/react'
import {containerFunctions} from '../testutil/rtlHelpers'
import Project from '../../src/model/Project'

// Hack to get Jest 28 to work with ESM firebase
jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(),
}))
jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}))

afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
})

test('generated app can be shown in runner page', async ()=> {


    const app = new App('t1', 'Test 1', {}, [
        new Page('p1', 'Page 1', {}, [
            new Text('text1', 'Text 1', {content: ex`"Hi there!"`}),
            new Text('text2', 'Text 2', {content: ex`2 + 2`}),
        ])])

    const project = new Project('proj1', 'Project 1', {}, [app])
    const theAppCode = generate(app, project).code
    // @ts-ignore
    global.fetch = jest.fn(() => Promise.resolve( {text: () => wait(10).then( () => theAppCode )}))

    await act( () => runAppFromWindowUrl('/web/some.funky.app'))
    await act( () => wait(20) )

    const {expectEl} = containerFunctions(document.getElementById('main') as HTMLElement)
    expectEl('Text1').toHaveTextContent('Hi there!')
    expectEl('Text2').toHaveTextContent(/^4$/)
})
