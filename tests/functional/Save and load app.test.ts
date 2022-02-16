import {expect, test} from '@playwright/test'
import {App, Text} from '../../src/model/index'
import {appFixture1} from '../util/appFixtures'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'
import {loadJSONFromString} from '../../src/model/loadJSON'
import {ex} from '../../src/util/helpers'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

// mock selecting the app file
const installMockFilePickers = (app: any) => {

    const mockFileHandle = {
        async getFile() { return {
            async text() { return JSON.stringify(app) }
        }},

        async createWritable() {
            return {
                text: '',
                async write(text: string) {
                    this.text = text
                },
                async close() {
                    const div = document.createElement('div')
                    div.id = '_testFile'
                    div.textContent = this.text
                    document.getElementById('_testFile')?.remove()
                    document.body.append(div)
                }
            }
        }
    }

    // @ts-ignore
    window.showOpenFilePicker = async () => [mockFileHandle]
    // @ts-ignore
    window.showSaveFilePicker = async () => mockFileHandle
}

const fileMenu = 'text=File'
const fileMenu_Open = 'ul[role="menu"] :text("Open")'
const fileMenu_Save = 'ul[role="menu"] :text("Save")'


test('load app from file into editor', async ({page}) => {
    await page.goto(runtimeRootUrl)

    await page.evaluate( installMockFilePickers, appFixture1())

    await page.click(fileMenu)
    await page.click(fileMenu_Open)

    // would select the app file here

    expect(await page.textContent(`${treeItemSelector} >> nth=0`)).toBe('Main Page')

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(`${treeItemSelector} >> nth=2`)).toBe('Second Text')

    await page.click(`${treeItemSelector} >> nth=2`)
    expect(await page.locator('textarea#content').textContent()).toBe('"The second bit of text"')

})

test('save previously loaded app to file', async ({page}) => {
    await page.goto(runtimeRootUrl)

    await page.evaluate( installMockFilePickers, appFixture1())

    await page.click(fileMenu)
    await page.click(fileMenu_Open)

    // would select the app file here

    expect(await page.textContent(`${treeItemSelector} >> nth=0`)).toBe('Main Page')

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(`${treeItemSelector} >> nth=2`)).toBe('Second Text')

    await page.click(`${treeItemSelector} >> nth=2`)
    expect(await page.locator('textarea#content').textContent()).toBe('"The second bit of text"')

    await page.fill('textarea#content', '"The updated second text"')
    expect(await page.locator('textarea#content').textContent()).toBe('"The updated second text"')

    await page.click(fileMenu)
    await page.click(fileMenu_Save)

    const updatedAppText = (await page.textContent('#_testFile')) as string
    const updatedApp = loadJSONFromString(updatedAppText) as App
    expect((updatedApp.pages[0].elementArray()[1] as Text).content).toStrictEqual(ex`"The updated second text"`)
})

test('save new app to file', async ({page}) => {
    await page.goto(runtimeRootUrl)
    await page.evaluate( installMockFilePickers, {})

    // expect editorInitialApp to be loaded

    expect(await page.textContent(`${treeItemSelector} >> nth=0`)).toBe('Main Page')

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(`${treeItemSelector} >> nth=2`)).toBe('Second Text')

    await page.click(`${treeItemSelector} >> nth=2`)
    expect(await page.locator('textarea#content').textContent()).toBe('"The future of low code programming"')

    await page.fill('textarea#content', '"The updated second text"')
    expect(await page.locator('textarea#content').textContent()).toBe('"The updated second text"')

    await page.click(fileMenu)
    await page.click(fileMenu_Save)

    const updatedAppText = (await page.textContent('#_testFile')) as string
    const updatedApp = loadJSONFromString(updatedAppText) as App
    expect((updatedApp.pages[0].elementArray()[1] as Text).content).toStrictEqual(ex`"The updated second text"`)
})

test('error message if cannot read app from file', async ({page}) => {
    await page.goto(runtimeRootUrl)
    await page.evaluate(installMockFilePickers, {})
    await page.click(fileMenu)
    await page.click(fileMenu_Open)

    // would select the app file here

    expect(await page.textContent('#errorMessage')).toBe('This file does not contain a valid Elemento app')
})
