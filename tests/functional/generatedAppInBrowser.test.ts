import {expect, test} from '@playwright/test';
import {wait} from './playwrightHelpers.js'

const pageUrl = '/run'

test('welcome app shows elements on page', async ({ page }) => {

    await page.goto(pageUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')
    expect(await page.textContent('p >> nth=1')).toBe('The future of low code programming')
})

test('can set app on page', async ({ page }) => {

    await page.goto(pageUrl+ '/editorPreview')

    await wait()
    await page.evaluate( (appCode: string) => (window as any).setAppCode(appCode), testAppCode)

    expect(await page.textContent('p[id="AppOne.MainPage.FirstText"]')).toBe('This is App One')
})

test('shows TextInput elements', async ({ page }) => {

    await page.goto(pageUrl+ '/editorPreview')

    await wait()
    await page.evaluate( (appCode: string) => (window as any).setAppCode(appCode), testAppCode)

    expect(await page.inputValue('input[type="text"] >> nth=0')).toBe('A text value')
})

test('can show pages', async ({ page }) => {
    await page.goto(pageUrl+ '/editorPreview')

    await wait()
    await page.evaluate( (appCode: string) => (window as any).setAppCode(appCode), testAppCode)
    expect(await page.textContent('p >> nth=0')).toBe('This is App One')

    await page.click('button')
    expect(await page.textContent('p >> nth=0')).toBe('Some text here')

    await page.click('button')
    expect(await page.textContent('p >> nth=0')).toBe('This is App One')
})

test.skip('can load app from web', async ({ page }) => {
    await page.goto(pageUrl+ '/web/www.dropbox.com/s/vqvwpfub8m4r9ni/AppOne.js?dl=0')
    expect(await page.textContent('p[id="AppOne.MainPage.FirstText"]')).toBe('This is App One')
})

test('shows error if cannot load app from web', async ({ page }) => {
    await page.goto(pageUrl+ '/web/www.dropbox.com/s/xxx/AppOne.js?dl=0')
    expect(await page.textContent('div.MuiAlertTitle-root')).toBe('Invalid app code')
})

test('can load app from GitHub', async ({ page }) => {
    await page.goto(pageUrl+ '/gh/rileydog16/dogslife')
    expect(await page.textContent('p[id="DogsLife.MainPage.FirstText"]')).toBe('Welcome to Dogs Life!')
})


const testAppCode = `
import React from 'react'
import Elemento from 'elemento-runtime'

// MainPage.js
function MainPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, TextInput, Button} = Elemento.components

    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const FirstTextInput = Elemento.useObjectState(pathWith('FirstTextInput'), new TextInput.State({value: "A text value"}))

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText')}, "This is App One"),
        React.createElement(TextElement, {path: pathWith('SecondText')}, "The second bit of text"),
        React.createElement(TextInput, {path: pathWith('FirstTextInput'), initialValue: "A text value"}),
        React.createElement(Button, {path: pathWith('Button1'), content: "Go to Page 2", action: () => ShowPage(OtherPage)}),
    )
}

// OtherPage.js
function OtherPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Button} = Elemento.components
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('SomeText')}, "Some text here"),
        React.createElement(TextElement, {path: pathWith('MoreText')}, "...and more text"),
        React.createElement(Button, {path: pathWith('Button2'), content: "Back to Page 1", action: () => ShowPage(MainPage)}),
    )
}

// appMain.js
export default function AppOne(props) {
    const pathWith = name => 'AppOne' + '.' + name
    const {App} = Elemento.components
    const pages = {MainPage, OtherPage}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))


    return React.createElement(App, {path: 'AppOne', },)
}
`
