import {expect, Page, test} from '@playwright/test'
import {treeExpand, treeItem} from './playwrightHelpers.js'

// Expects test server such as Parcel dev server running on port 1234
const pageUrl = '/studio'

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
                    document.body.appendChild(div)
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
const fileMenu_New = 'ul[role="menu"] :text("New")'
const fileMenu_Open = 'ul[role="menu"] :text("Open")'
const fileMenu_Export = 'ul[role="menu"] :text("Export")'

let openMainPage = async function (page: Page) {
    await page.click(treeExpand(0))
    await page.click(treeExpand(1))
    await page.click(treeExpand(2))
    expect(await page.textContent(treeItem(2))).toBe('Main Page')
}

test('creates new project and updates it and auto-saves and reloads', async ({page}) => {
    await page.goto(pageUrl)

    await page.click(fileMenu)
    await page.click(fileMenu_New)

    const projectName = 'Project ' + Date.now()
    await page.fill('input:visible', projectName)
    await page.locator('button', { hasText: 'Create' }).click()

    await openMainPage(page)
    expect(await page.textContent(treeItem(2))).toBe('Main Page')

    await page.click(treeItem(2))
    expect(await page.locator('input#name').inputValue()).toBe('Main Page')
    await page.locator('input#name').fill('First Page')

    await page.click(fileMenu)
    await page.click(fileMenu_Open)
    await page.click(`ul.MuiList-root >> text=${projectName}`)
    expect(await page.textContent(treeItem(2))).toBe('First Page')

})

test('exports app to file', async ({page}) => {
    await page.goto(pageUrl)
    await page.evaluate(installMockFilePickers, {})

    await page.click(fileMenu)
    await page.click(fileMenu_New)

    const projectName = 'Project ' + Date.now()
    await page.fill('input:visible', projectName)
    await page.locator('button', { hasText: 'Create' }).click()

    await openMainPage(page)

    await page.click(treeItem(2))
    await page.locator('input#name').fill('First Page')

    await page.click(fileMenu)
    await page.click(fileMenu_Export)

    const updatedProjectText = (await page.textContent('#_testFile')) as string
    const updatedProject = JSON.parse(updatedProjectText)
    expect(updatedProject.elements[0].elements[0].name).toBe('First Page')
})

// May use this test when Import project implemented
// test('error message if cannot read app from file', async ({page}) => {
//     await page.goto(pageUrl)
//     await page.evaluate(installMockFilePickers, {})
//     await page.click(fileMenu)
//     await page.click(fileMenu_Open)
//
//     // would select the app file here
//
//     expect(await page.textContent('#alertMessage')).toBe('This file does not contain a valid Elemento project')
// })
