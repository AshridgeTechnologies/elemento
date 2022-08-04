import {expect, test} from '@playwright/test';
import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import Button from '../../src/model/Button'
import {ex} from '../testutil/testHelpers'
// import {loadApp} from './loadAppHelper'
import TextInput from '../../src/model/TextInput'

// Expects test server such as Parcel dev server running on port 1234
const pageUrl = '/run'

test.skip('formulas using inputs update as the input changes', async ({page}) => {
    // await page.goto(pageUrl + '/editorPreview')
    //
    // const app = new App('app1', 'App One', {}, [
    //     new Page('page_1', 'Main Page', {}, [
    //         new TextInput('textInput_1', 'Name Input', {label: ex`"Name"`, initialValue: ex`"Alice"`}),
    //         new TextInput('textInput_2', 'Greeting Input', {label: ex`"Greeting"`, initialValue: ex`"How are you?"`}),
    //         new Text('text_1', 'Hello Text', {content: ex`NameInput.value + " - " + GreetingInput.value`}),
    //     ]),
    // ])
    //
    // await loadApp(page, app)
    //
    // expect(await page.textContent('p >> nth=0')).toBe('Alice - How are you?')
    //
    // await page.fill('input >> nth=0', 'Davy')
    // expect(await page.textContent('p >> nth=0')).toBe('Davy - How are you?')
    //
    // await page.fill('input >> nth=1', 'Whassup?')
    // expect(await page.textContent('p >> nth=0')).toBe('Davy - Whassup?')
})

test.skip('actions can refer to other controls', async ({page}) => {
    // await page.goto(pageUrl + '/editorPreview')
    //
    // const app = new App('app1', 'App One', {}, [
    //     new Page('page_1', 'Main Page', {}, [
    //         new TextInput('textInput_1', 'Name Input', {label: ex`"Name"`, initialValue: ''}),
    //         new Text('text_1', 'Hello Text', {content: ex`"Hello " + NameInput.value`}),
    //         new Button('button_1', 'Clear Name', {content: 'Clear', action: ex`Reset(NameInput)`}),
    //     ]),
    // ])
    // await loadApp(page, app)
    //
    // expect(await page.textContent('p >> nth=0')).toBe('Hello ')
    //
    // await page.fill('input >> nth=0', 'Davy')
    // expect(await page.textContent('p >> nth=0')).toBe('Hello Davy')
    //
    // await page.click('button')
    // expect(await page.textContent('p >> nth=0')).toBe('Hello ')
})