/**
 * @jest-environment jsdom
 */

import AppRunner from '../../src/runtime/AppRunner'
import React, {createElement} from 'react'
import * as Elemento from '../../src/runtime/index'
import '@testing-library/jest-dom'
import {App} from '../../src/runtime/components/index'
import {highlightClassName, highlightElement} from '../../src/runtime/runtimeFunctions'
import {addContainer, } from '../testutil/elementHelpers'
import {actWait, wait} from '../testutil/rtlHelpers'
import AppContext, {UrlType} from '../../src/runtime/AppContext'
import {AppData} from '../../src/runtime/components/App'

const appContext: AppContext = {
    getUrl(): UrlType { return {location: {origin: 'http://foo.com', pathname: '/MainPage/xyz', query: {a: '10'}, hash: 'mark1'}, pathPrefix: 'pp'}},
    updateUrl(path: string, query: object, anchor: string): void {},
    onUrlChange(callback: any) { return () => {} },
    goBack(): void {}
}
const appRunner = (appFunction: React.FunctionComponent<any> = testApp('One'),
                   selectedComponentId?: string) => createElement(AppRunner, {
    appFunction,
    appContext,
    onComponentSelected,
    selectedComponentId
})

const testApp = (version: string) => {
    function MainPage(props: {path: string}) {
        const pathWith = (name: string) => props.path + '.' + name
        const {Page, TextElement, TextInput} = Elemento.components
        const input1 = Elemento.useObjectState(pathWith('input1'), new TextInput.State({value: undefined}),)
        const app = Elemento.useGetObjectState('app') as AppData

        // @ts-ignore
        return React.createElement(Page, {id: props.path},
            React.createElement(TextElement, {path: pathWith('FirstText')}, 'This is App ' + version),
            React.createElement(TextInput, {path: pathWith('input1'), label: 'input1'}),
            // @ts-ignore
            React.createElement(TextElement, {path: pathWith('SecondText'), onClick: (event) => {if (event.altKey) throw new Error('Should not be called')} }, "Input is " + input1),
            React.createElement(TextElement, {path: pathWith('TheUrl'), }, app.CurrentUrl().text),
        )
    }

    function AppOne(props: {appContext: AppContext}) {

        const pages = {MainPage: MainPage as any}
        const {App} = Elemento.components
        // @ts-ignore
        const {appContext} = props
        const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
        return React.createElement(App, {path: 'AppOne'})
    }

    return AppOne
}

const badApp = () => {
    function MainPage(props: {path: string}) {
        const pathWith = (name: string) => props.path + '.' + name
        const {Page, TextElement, TextInput} = Elemento.components
        const app = Elemento.useGetObjectState('app') as AppData

        // @ts-ignore
        const goWrong = () => {throw new Error('Aaaargh!')}
        return React.createElement(Page, {path: 'MainPage'},
            React.createElement(TextElement, {path: pathWith('FirstText')}, 'This is App ' + goWrong()),
        )
    }

    function AppOne(props: {appContext: AppContext}) {

        const pages = {MainPage: MainPage as any}
        const {App} = Elemento.components
        // @ts-ignore
        const {appContext} = props
        const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
        return React.createElement(App, {path: 'AppOne'})
    }

    return AppOne
}
let onComponentSelected: (id: string) => void

let container: any, {click, elIn, enter, expectEl, renderThe} = container = addContainer()
beforeEach(async () => {
    ({click, elIn, enter, expectEl, renderThe} = container = addContainer())
    onComponentSelected = jest.fn()
    renderThe(appRunner())
})

test('shows app on page', () => {
    expectEl('FirstText').toHaveTextContent('This is App One')
})

test('passes app context', () => {
    expectEl('TheUrl').toHaveTextContent('http://foo.com/pp/MainPage/xyz?a=10#mark1')
})

test('updates app on page', () => {
    expectEl('FirstText').toHaveTextContent('This is App One')
    renderThe(appRunner(testApp('Two')))
    expectEl('FirstText').toHaveTextContent('This is App Two')
})

test('app can set state', async () => {
    await enter('input1', 'cool')
    expectEl('SecondText').toHaveTextContent('Input is cool')
})

test('app can keep state when app is updated', async () => {
    renderThe(appRunner(testApp('One')))
    await actWait(() => enter('input1', 'cool'))
    renderThe(appRunner(testApp('Two')))
    expectEl('SecondText').toHaveTextContent('Input is cool')
})

test('can run multiple apps with independent state', async () => {
    const container2 = addContainer()
    await actWait( () => container2.renderThe(appRunner(testApp('Two'))) )

    await container.enter('input1', 'cool')
    container.expectEl('SecondText').toHaveTextContent('Input is cool')
    container2.expectEl('SecondText').toHaveTextContent('Input is')

    await container2.enter('input1', 'hot')
    container.expectEl('SecondText').toHaveTextContent('Input is cool')
    container2.expectEl('SecondText').toHaveTextContent('Input is hot')
})

test('notifies id when component selected', () => {
    click('SecondText', {altKey: true})
    expect(onComponentSelected).toHaveBeenCalledWith('AppOne.MainPage.SecondText')
})

test('does not notify id when component clicked normally', () => {
    click('SecondText', {altKey: false})
    expect(onComponentSelected).not.toHaveBeenCalled()
})

test('highlights selected component', function () {
    renderThe(appRunner(testApp('One'), 'AppOne.MainPage.SecondText'))
    expectEl('SecondText').toHaveClass(highlightClassName)
    const styleEl = document.getElementById('elementoEditorHighlight')
    expect(styleEl!.innerHTML).toMatch(`.${highlightClassName}`)
})

test('can change to highlight a different component', function () {
    highlightElement('AppOne.MainPage.FirstText')
    expectEl('FirstText').toHaveClass(highlightClassName)
    expectEl('SecondText').not.toHaveClass(highlightClassName)

    highlightElement('AppOne.MainPage.SecondText')
    expectEl('FirstText').not.toHaveClass(highlightClassName)
    expectEl('SecondText').toHaveClass(highlightClassName)
})

test('shows error fallback for unexpected error', () => {
    const originalError = console.error
    console.error = jest.fn()
    try {
        renderThe(appRunner(badApp()))
    } catch (e) {
        console.error = originalError
    }
    expect(console.error).toHaveBeenCalled()
    expect(container.domContainer.textContent).toContain('Unable to display the app due to an error')
})