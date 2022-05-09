/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import {act} from '@testing-library/react'
import '@testing-library/jest-dom'
import {addContainer} from '../testutil/elementHelpers'
import AppRunnerForPreview from '../../src/runtime/AppRunnerForPreview'
import {highlightClassName} from '../../src/runtime/runtimeFunctions'

const appCode = (num: string) => `
import React from 'react'
import Elemento from 'elemento-runtime'

function MainPage(props) {
    const pathWith = (name) => props.path + '.' + name
    const state = Elemento.useObjectStateWithDefaults(props.path, {})
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    const {ShowPage} = Elemento.appFunctions(state)
    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "This is App " + ${num}),
        React.createElement(TextElement, {path: pathWith('t1')}, Elemento.codeGenerationError(\`sumxx(2, 3, 4)\`, 'Unknown names: sumxx')),
    )
}

export default function AppOne(props) {
    const pages = {MainPage}
    const {App} = Elemento.components
    return React.createElement(App, {id: 'AppOne', pages})
}


`

const appRunnerForPreview = () => createElement(AppRunnerForPreview)

let container: any, {click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer()

beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe, renderIt} = container = addContainer())
})

afterEach(() => {
    // @ts-ignore
    delete window.setAppCode
    // @ts-ignore
    delete window.setComponentSelectedListener
    // @ts-ignore
    delete window.highlightElement
})

test('can show app on page', () => {
    renderIt(appRunnerForPreview())
    act(() => window.setAppCode(appCode('"One"')))
    expectEl('FirstText').toHaveTextContent('This is App One')
})

test('can update app on page', () => {
    renderIt(appRunnerForPreview())
    act(() => window.setAppCode(appCode('"One"')))
    expectEl('FirstText').toHaveTextContent('This is App One')
    act(() => window.setAppCode(appCode('"Two"')))
    expectEl('FirstText').toHaveTextContent('This is App Two')
})

test('can listen for component selected events on page', () => {
    const onComponentSelected = jest.fn()

    renderIt(appRunnerForPreview())
    act(() => {
        window.setAppCode(appCode('"One"'))
        window.setComponentSelectedListener(onComponentSelected)
    })
    click('FirstText', {altKey: true})
    expect(onComponentSelected).toHaveBeenCalledWith('AppOne.MainPage.FirstText')
})

test('can highlight component on page', () => {
    renderIt(appRunnerForPreview())
    act(() => {
        window.setAppCode(appCode('"One"'))
        window.highlightElement('AppOne.MainPage.FirstText')
    })
    expectEl('FirstText').toHaveClass(highlightClassName)
})

test('can highlight component in a list on page', () => {
    renderIt(appRunnerForPreview())
    act(() => {
        window.setAppCode(appCode('"One"'))
        window.highlightElement('AppOne.MainPage.FirstText')
    })
    expectEl('FirstText').toHaveClass(highlightClassName)
})
