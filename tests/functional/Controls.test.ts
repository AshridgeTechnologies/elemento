import {expect, Frame, test, Page as PWPage} from '@playwright/test';
import {Project, App, Page, TextInput} from '../../src/model/index'
import {loadProject, treeItem, treeExpand} from './playwrightHelpers'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/studio'

const insertMenu = 'text=Insert'
const insertMenu_Button = 'ul[role="menu"] :text("Button")'
const insertMenu_NumberInput = 'ul[role="menu"] :text("Number Input")'
const insertMenu_SelectInput = 'ul[role="menu"] :text("Select Input")'
const insertMenu_TrueFalseInput = 'ul[role="menu"] :text("True False Input")'
const insertMenu_Data = 'ul[role="menu"] :text("Data")'
const insertMenu_Page = 'ul[role="menu"] :text("Page")'
const yesOption = 'li[role="option"]:text("Yes")'

test.describe('Controls can be used', () => {

    const project = new Project('project1', 'Project One', {}, [new App('app1', 'App One', {}, [
        new Page('page_1', 'Control Test Page', {}, [
            new TextInput('textInput_1', 'Name Input', {label: `Name`}),
        ]),
    ])
    ])

    let selectControlTestPage = async function (page: PWPage) {
        await page.click(treeExpand(0))
        await page.click(treeExpand(1))
        expect(await page.textContent(treeItem(2))).toBe('Control Test Page')
        await page.click(treeExpand(2))
        await page.click(treeItem(2))
    }

    test('button', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_Button)
        expect(await page.textContent(treeItem(3))).toBe('Button 1')

        await page.fill('input#content', 'A button!')
        expect(await appFrame.textContent('button >> nth=0')).toBe('A button!')
    })

    test('number input', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_NumberInput)
        expect(await page.textContent(treeItem(3))).toBe('Number Input 1')

        await page.fill('input#initialValue', '99')
        expect(await appFrame.inputValue('input >> nth=0')).toBe('99')
    })

    test('select input', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_SelectInput)
        expect(await page.textContent(treeItem(3))).toBe('Select Input 1')

        await page.fill('input#values', 'Blue, Red')
        await page.fill('input#initialValue', 'Red')
        expect(await appFrame.inputValue('input >> nth=0')).toBe('Red')
    })

    test('true false input', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_TrueFalseInput)
        expect(await page.textContent(treeItem(3))).toBe('True False Input 1')

        await page.click('#initialValue')
        await page.click(yesOption)
        expect(await appFrame.isChecked('input >> nth=0')).toBe(true)
    })

    test('data', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_Data)
        expect(await page.textContent(treeItem(3))).toBe('Data 1')

        await page.fill('input#initialValue', 'Some data')
        await page.click('#display')
        await page.click(yesOption)
        expect(await appFrame.textContent('div[id="AppOne.ControlTestPage.Data1"] code')).toBe(`'Some data'`)
    })

    test('new page', async ({ page }) => {
        await page.goto(runtimeRootUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_Page)
        expect(await page.textContent(treeItem(4))).toBe('Page 2')
    })

})
