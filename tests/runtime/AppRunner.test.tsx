/**
 * @jest-environment jsdom
 */

import AppRunner from '../../src/runtime/AppRunner'
import React, {createElement} from 'react'
import * as Elemento from '../../src/runtime/index'
import '@testing-library/jest-dom'
import {App} from '../../src/runtime/components/index'
import {highlightClassName} from '../../src/runtime/runtimeFunctions'
import {addContainer, } from '../testutil/elementHelpers'
import {wait} from '../testutil/rtlHelpers'

const appRunner = (appFunction: React.FunctionComponent<any> = testApp('One'), selectedComponentId?: string) => createElement(AppRunner, {appFunction, onComponentSelected, selectedComponentId})

const testApp = (version: string) => {
    function MainPage(props: {path: string}) {
        const pathWith = (name: string) => props.path + '.' + name
        const {Page, TextElement, TextInput} = Elemento.components
        const input1 = Elemento.useObjectState(pathWith('input1'), new TextInput.State({value: undefined}),)

        // @ts-ignore
        return React.createElement(Page, {id: props.path},
            React.createElement(TextElement, {path: pathWith('FirstText')}, `This is App ${version}`),
            React.createElement(TextInput, {path: pathWith('input1'), label: 'input1'}),
            // @ts-ignore
            React.createElement(TextElement, {path: pathWith('SecondText'), onClick: (event) => {if (event.altKey) throw new Error('Should not be called')} }, "Input is " + input1),
        )
    }

    function AppOne() {

        const pages = {MainPage}
        const {App} = Elemento.components
        // @ts-ignore
        const app = Elemento.useObjectState('app', new App.State({pages}))

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
    await wait(0)
})

test('shows app on page', () => {
    expectEl('FirstText').toHaveTextContent('This is App One')
})

test('updates app on page', () => {
    expectEl('FirstText').toHaveTextContent('This is App One')
    renderThe(appRunner(testApp('Two')))
    expectEl('FirstText').toHaveTextContent('This is App Two')
})

test('app can set state', async () => {
    enter('input1', 'cool')
    await wait(20)
    expectEl('SecondText').toHaveTextContent('Input is cool')
})

test('app can keep state when app is updated', () => {
    renderThe(appRunner(testApp('One')))
    enter('input1', 'cool')
    renderThe(appRunner(testApp('Two')))
    expectEl('SecondText').toHaveTextContent('Input is cool')
})

test('can run multiple apps with independent state', async () => {
    const container2 = addContainer()
    container2.renderThe(appRunner(testApp('Two')))
    await wait(20)

    container.enter('input1', 'cool')
    await wait(20)
    container.expectEl('SecondText').toHaveTextContent('Input is cool')
    container2.expectEl('SecondText').toHaveTextContent('Input is')

    container2.enter('input1', 'hot')
    await wait(20)
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
})

test.todo('shows error fallback for unexpected error')