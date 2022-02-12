import {expect, test} from '@playwright/test';
import {App, Page, Text, TextInput} from '../../src/model/index'
import {ex} from '../../src/util/helpers'
import {loadApp} from './playwrightHelpers'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/runtime/app.html'

test('formulas using inputs update as the input changes', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    const app = new App('app1', 'App One', {}, [
        new Page('page1', 'Main Page', {}, [
            new TextInput('textInput_1', 'Name Input', {label:ex`"Name"`, initialValue: ex`"Alice"`}),
            new TextInput('textInput_2', 'Greeting Input', {label:ex`"Greeting"`, initialValue: ex`"How are you?"`}),
            new Text('text_1', 'Hello Text', {content: ex`NameInput.value + " - " + GreetingInput.value`}),
        ]),
    ])

    await loadApp(page, app)

    expect(await page.textContent('p >> nth=0')).toBe('Alice - How are you?')

    await page.fill('input >> nth=0', 'Davy')
    expect(await page.textContent('p >> nth=0')).toBe('Davy - How are you?')

    await page.fill('input >> nth=1', 'Whassup?')
    expect(await page.textContent('p >> nth=0')).toBe('Davy - Whassup?')
})
