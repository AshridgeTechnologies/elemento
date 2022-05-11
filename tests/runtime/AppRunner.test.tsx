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

const appRunner = (appFunction: React.FunctionComponent<any> = testApp('One'), selectedComponentId?: string) => createElement(AppRunner, {appFunction, onComponentSelected, selectedComponentId})

const testApp = (version: string) => {
    function MainPage(props: {path: string}) {
        const pathWith = (name: string) => props.path + '.' + name
        const {Page, TextElement, TextInput} = Elemento.components
        const state = Elemento.useObjectStateWithDefaults(props.path, {
            input1: {_type: TextInput.State},
        })
        const {input1} = state
        // @ts-ignore
        return React.createElement(Page, {id: props.path},
            React.createElement(TextElement, {path: pathWith('FirstText')}, `This is App ${version}`),
            React.createElement(TextInput, {state: input1, label: 'input1'}),
            React.createElement(TextElement, {path: pathWith('SecondText')}, "Input is " + input1),
        )
    }

    function AppOne() {

        const pages = {MainPage}
        const {App} = Elemento.components
        return React.createElement(App, {id: 'AppOne', pages})
    }

    return AppOne
}
let onComponentSelected: (id: string) => void

let container: any, {click, elIn, enter, expectEl, renderThe} = container = addContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe} = container = addContainer())
    onComponentSelected = jest.fn()
    renderThe(appRunner())
})

test('shows app on page', () => {
    expectEl('FirstText').toHaveTextContent('This is App One')
})

test('updates app on page', () => {
    expectEl('FirstText').toHaveTextContent('This is App One')
    renderThe(appRunner(testApp('Two')))
    expectEl('FirstText').toHaveTextContent('This is App Two')
})

test('app can set state', function () {
    enter('input1', 'cool')
    expectEl('SecondText').toHaveTextContent('Input is cool')
})

test('app can keep state when app is updated', () => {
    renderThe(appRunner(testApp('One')))
    enter('input1', 'cool')
    renderThe(appRunner(testApp('Two')))
    expectEl('SecondText').toHaveTextContent('Input is cool')
})

test('can run multiple apps with independent state', () => {
    const container2 = addContainer()
    container2.renderThe(appRunner(testApp('Two')))

    container.enter('input1', 'cool')
    container.expectEl('SecondText').toHaveTextContent('Input is cool')
    container2.expectEl('SecondText').toHaveTextContent('Input is')

    container2.enter('input1', 'hot')
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