/**
 * @jest-environment jsdom
 */

import AppRunner from '../../src/runner/AppRunner'
import React, {createElement} from 'react'
import * as Elemento from '../../src/runtime/index'
import '@testing-library/jest-dom'
import {App} from '../../src/runtime/components/index'
import {highlightClassName, highlightElement} from '../../src/runtime/runtimeFunctions'
import {actWait, testContainer} from '../testutil/rtlHelpers'
import AppContext, {UrlType} from '../../src/runtime/AppContext'
import {AppData} from '../../src/runtime/components/AppData'
import {useGetStore} from '../../src/runtime/index'

jest.mock('../../src/runtime/components/authentication')   // prevent error when firebaseApp tries to call global fetch to load config

const pathPrefix = 'pp'
const resourceUrl = 'https://example.com:8080/app/somewhere'
let onComponentSelected: (id: string) => void

const appRunner = (appFunction: React.FunctionComponent<any> = testApp('One'),
                   selectedComponentId?: string) => createElement(AppRunner, {
    appFunction,
    pathPrefix,
    onComponentSelected,
    selectedComponentId,
    resourceUrl
})

const testApp = (version: string) => {
    function MainPage(props: {path: string}) {
        const pathWith = (name: string) => props.path + '.' + name
        const {Page, TextElement, TextInput, Image} = Elemento.components
        const _store = useGetStore()
        const input1 = _store.setObject(pathWith('input1'), new TextInput.State({value: undefined}),)
        const app = Elemento.useGetObjectState('AppOne') as AppData

        return React.createElement(Page, {path: props.path},
            React.createElement(TextElement, {path: pathWith('FirstText'), content:'This is App ' + version } ),
            React.createElement(TextInput, {path: pathWith('input1'), label: 'input1'}),
            // @ts-ignore
            React.createElement(TextElement, {path: pathWith('SecondText'), content: "Input is " + input1, onClick: (event) => {if (event.altKey) throw new Error('Should not be called')} }, ),
            React.createElement(TextElement, {path: pathWith('TheUrl'), content: app.CurrentUrl().text} ),
            React.createElement(Image, {path: pathWith('TheImage'), source: 'Duck.jpg'}),
        )
    }

    function AppOne(props: {appContext: AppContext}) {

        const pages = {MainPage: MainPage as any}
        const {App} = Elemento.components
        const appContext = Elemento.useGetAppContext() as AppContext
        const _store = Elemento.useGetStore()
        const app = _store.setObject('AppOne', new App.State({pages, appContext}))
        return React.createElement(App, {path: 'AppOne'})
    }

    return AppOne
}

const badApp = () => {
    function MainPage(props: {path: string}) {
        const pathWith = (name: string) => props.path + '.' + name
        const {Page, TextElement, TextInput} = Elemento.components
        const app = Elemento.useGetObjectState('AppOne') as AppData

        // @ts-ignore
        const goWrong = () => {throw new Error('Aaaargh!')}
        return React.createElement(Page, {path: 'MainPage'},
            React.createElement(TextElement, {path: pathWith('FirstText'), content: 'This is App ' + goWrong()} ),
        )
    }

    function AppOne(props: {appContext: AppContext}) {

        const pages = {MainPage: MainPage as any}
        const {App} = Elemento.components
        const _store = Elemento.useGetStore()

        // @ts-ignore
        const {appContext} = props
        const app = _store.setObject('AppOne', new App.State({pages, appContext}))
        return React.createElement(App, {path: 'AppOne'})
    }

    return AppOne
}

let container: any, {click, elIn, enter, expectEl, renderThe} = container = testContainer()
beforeEach(async () => {
    ({click, elIn, enter, expectEl, renderThe} = container = testContainer())
    onComponentSelected = jest.fn()
    renderThe(appRunner())
})

test('shows app on page', () => {
    expectEl('FirstText').toHaveTextContent('This is App One')
})

test('passes app context', () => {
    expectEl('TheUrl').toHaveTextContent('http://localhost/pp')
})

test('makes app utils available to images', () => {
    expectEl('TheImage').toHaveAttribute('src', 'https://example.com:8080/app/somewhere/Duck.jpg')
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
    const container2 = testContainer(appRunner(testApp('Two')), 'testContainer2')

    await container.enter('input1', 'cool')
    container.expectEl('SecondText').toHaveTextContent('Input is cool')
    container2.expectEl('SecondText').toHaveTextContent('Input is')

    await container2.enter('input1', 'hot')
    container.expectEl('SecondText').toHaveTextContent('Input is cool')
    container2.expectEl('SecondText').toHaveTextContent('Input is hot')
})

test('notifies id when component selected', () => {
    const container3 = testContainer(appRunner(), 'testContainer3')
    container3.click('SecondText', {altKey: true})
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
