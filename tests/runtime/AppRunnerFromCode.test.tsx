/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromCode from '../../src/runtime/AppRunnerFromCode'
import '@testing-library/jest-dom'
import {addContainer} from '../testutil/elementHelpers'
import AppContext, {UrlType} from '../../src/runtime/AppContext'
import AppRunner from '../../src/runtime/AppRunner'

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

const appContext: AppContext = {
    getUrl(): UrlType { return {location: {origin: 'http://foo.com', pathname: '/MainPage/xyz', query: {a: '10'}, hash: 'mark1'}, pathPrefix: 'pp'}},
    updateUrl(path: string, query: object, anchor: string): void {},
    onUrlChange: jest.fn()
}

const appRunnerFromCode = (code: string) => createElement(AppRunnerFromCode, {appCode: appCode(code), appContext})

let container: any, {click, elIn, enter, expectEl, renderThe} = container = addContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe} = container = addContainer())
    renderThe(appRunnerFromCode('"One"'))
})

test('shows app on page', function () {
    expectEl('FirstText').toHaveTextContent('This is App One')
})

test('passes app context', () => {
    expectEl('TheUrl').toHaveTextContent('http://foo.com/pp/MainPage/xyz?a=10#mark1')
})

test('updates app when code changes', function () {
    expectEl('FirstText').toHaveTextContent('This is App One')
    renderThe(appRunnerFromCode('"Two"'))
    expectEl('FirstText').toHaveTextContent('This is App Two')
})

test('shows error if code is invalid', function () {
    renderThe(appRunnerFromCode('return x'))
    expectEl('errorMessage').toHaveTextContent('Elemento is unable to run this app as there is an error in the code')
    expectEl('errorMessage').toHaveTextContent('Unexpected token \'return\'')
})
