/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import AppRunnerForPreview from '../../src/runner/AppRunnerForPreview'
import {highlightClassName} from '../../src/runtime/runtimeFunctions'

import {setConfig, getConfig} from '../../src/runtime/components/firebaseApp'
import {getDefaultAppContext} from '../../src/runtime/AppContext'
import {actWait, testContainer} from '../testutil/rtlHelpers'
import {wait} from '../testutil/testHelpers'

jest.mock('../../src/runtime/components/firebaseApp')

const appCode = (num: string) => `
import React from 'react'
import Elemento from 'elemento-runtime'

function MainPage(props) {
    const pathWith = (name) => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    const app = Elemento.useGetObjectState('app')
    
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "This is App " + ${num}),
        React.createElement(TextElement, {path: pathWith('t1')}, Elemento.codeGenerationError(\`sumxx(2, 3, 4)\`, 'Unknown names: sumxx')),
        React.createElement(TextElement, {path: pathWith('TheUrl'), }, app.CurrentUrl().text),
    )
}

export default function AppOne(props) {

        const pages = {MainPage}
        const {App} = Elemento.components
        const {appContext} = props
        const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

        return React.createElement(App, {path: 'AppOne'})
    }
`

const appRunnerForPreview = () => createElement(AppRunnerForPreview, {pathPrefix: '/some/prefix'})

let container: any, {click, elIn, enter, expectEl, renderThe} = container = testContainer()

beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe} = container = testContainer())
})

afterEach(() => {
    // @ts-ignore
    delete window.setAppCode
    // @ts-ignore
    delete window.setFirebaseConfig
    // @ts-ignore
    delete window.setComponentSelectedListener
    // @ts-ignore
    delete window.highlightElement
})

test('can show app on page', () => {
    renderThe(appRunnerForPreview())
    act(() => window.setAppCode(appCode('"One"')))
    expectEl('FirstText').toHaveTextContent('This is App One')
})

test('passes app context to app with correct prefix', () => {
    renderThe(appRunnerForPreview())
    act(() => window.setAppCode(appCode('"One"')))
    expectEl('TheUrl').toHaveTextContent('http://localhost/some/prefix')
})

test('responds to browser history updates', async () => {
    renderThe(appRunnerForPreview())
    const appContext = getDefaultAppContext('/some/prefix')

    act(() => window.setAppCode(appCode('"One"')))
    expectEl('TheUrl').toHaveTextContent('http://localhost/some/prefix')
    await actWait(() => appContext.updateUrl('/MainPage/abc', null, null))
    expect(window.location.href).toBe('http://localhost/some/prefix/MainPage/abc')
    expectEl('TheUrl').toHaveTextContent('http://localhost/some/prefix/MainPage/abc')
    act(() => window.history.back())
    expectEl('TheUrl').toHaveTextContent('http://localhost/some/prefix')
})

test('can update app on page', () => {
    renderThe(appRunnerForPreview())
    act(() => window.setAppCode(appCode('"One"')))
    expectEl('FirstText').toHaveTextContent('This is App One')
    act(() => window.setAppCode(appCode('"Two"')))
    expectEl('FirstText').toHaveTextContent('This is App Two')
})

test('can update config on page if it is different', () => {
    renderThe(appRunnerForPreview())
    const config = {projectId: 'proj1'}
    const configCopy = {projectId: 'proj1'}
    const newConfig = {projectId: 'proj2'}

    act(() => window.setFirebaseConfig(config))
    expect(setConfig).toHaveBeenCalledWith(config)

    const mock_getConfig = getConfig as jest.MockedFunction<any>
    mock_getConfig.mockReturnValue(config)

    act(() => window.setFirebaseConfig(configCopy))
    expect(setConfig).toHaveBeenCalledTimes(1)

    act(() => window.setFirebaseConfig(newConfig))
    expect(setConfig).toHaveBeenCalledTimes(2)
    expect(setConfig).toHaveBeenLastCalledWith(newConfig)
})

test('can listen for component selected events on page', () => {
    const onComponentSelected = jest.fn()

    renderThe(appRunnerForPreview())
    act(() => {
        window.setAppCode(appCode('"One"'))
        window.setComponentSelectedListener(onComponentSelected)
    })
    click('FirstText', {altKey: true})
    expect(onComponentSelected).toHaveBeenCalledWith('AppOne.MainPage.FirstText')
})

test('can highlight component on page', () => {
    renderThe(appRunnerForPreview())
    act(() => {
        window.setAppCode(appCode('"One"'))
        window.highlightElement('AppOne.MainPage.FirstText')
    })
    expectEl('FirstText').toHaveClass(highlightClassName)
})

test('can highlight component in a list on page', () => {
    renderThe(appRunnerForPreview())
    act(() => {
        window.setAppCode(appCode('"One"'))
        window.highlightElement('AppOne.MainPage.FirstText')
    })
    expectEl('FirstText').toHaveClass(highlightClassName)
})
