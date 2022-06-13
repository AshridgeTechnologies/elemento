/**
 * @jest-environment jsdom
 */

import React, {createElement} from 'react'
import AppRunnerFromCode from '../../src/runtime/AppRunnerFromCode'
import '@testing-library/jest-dom'
import {addContainer} from '../testutil/elementHelpers'

const appCode = (num: string) => `
import React from 'react'
import Elemento from 'elemento-runtime'

function MainPage(props) {
    const pathWith = (name) => props.path + '.' + name
    const {Page, TextElement} = Elemento.components
    const {Sum} = Elemento.globalFunctions
    const {ShowPage} = Elemento.appFunctions()
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

const appRunnerFromCode = (code: string) => createElement(AppRunnerFromCode, {appCode: appCode(code)})

let container: any, {click, elIn, enter, expectEl, renderThe} = container = addContainer()
beforeEach(() => {
    ({click, elIn, enter, expectEl, renderThe} = container = addContainer())
    renderThe(appRunnerFromCode('"One"'))
})

test('shows app on page', function () {
    expectEl('FirstText').toHaveTextContent('This is App One')
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
