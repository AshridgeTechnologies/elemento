import {expect, Frame, test} from '@playwright/test';
import {App, Page, TextInput} from '../../src/model/index'
import {loadApp} from './playwrightHelpers'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

const mainPageTreeItem = `${treeItemSelector} >> nth=0`
const mainPageTreeExpand = `${treeExpandControlSelector} >> nth=0`
const treeMainPageElementItem = (n: number) => `${treeItemSelector} >> nth=${n+1}`
const treeElementItem = (n: number) => `${treeItemSelector} >> nth=${n}`

const insertMenu = 'text=Insert'
const insertMenu_Button = 'ul[role="menu"] :text("Button")'
const insertMenu_NumberInput = 'ul[role="menu"] :text("Number Input")'
const insertMenu_SelectInput = 'ul[role="menu"] :text("Select Input")'
const insertMenu_TrueFalseInput = 'ul[role="menu"] :text("True False Input")'
const insertMenu_Page = 'ul[role="menu"] :text("Page")'
const yesOption = 'li[role="option"]:text("Yes")'

test.describe('Controls can be used', () => {

    test('button', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        const app = new App('app1', 'App One', {}, [
            new Page('page_1', 'Control Test Page', {}, [
                new TextInput('textInput_1', 'Name Input', {label:`Name`}),
            ]),
        ])

        await loadApp(page, app)
        expect(await page.textContent(mainPageTreeItem)).toBe('Control Test Page')
        await page.click(mainPageTreeExpand)
        await page.click(mainPageTreeItem)

        await page.click(insertMenu)
        await page.click(insertMenu_Button)
        expect(await page.textContent(treeMainPageElementItem(0))).toBe('Button 1')

        await page.fill('input#content', 'A button!')
        expect(await appFrame.textContent('button >> nth=0')).toBe('A button!')
    })

    test('number input', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        const app = new App('app1', 'App One', {}, [
            new Page('page_1', 'Control Test Page', {}, [
                new TextInput('textInput_1', 'Name Input', {label:`Name`}),
            ]),
        ])

        await loadApp(page, app)
        expect(await page.textContent(mainPageTreeItem)).toBe('Control Test Page')
        await page.click(mainPageTreeExpand)
        await page.click(mainPageTreeItem)

        await page.click(insertMenu)
        await page.click(insertMenu_NumberInput)
        expect(await page.textContent(treeMainPageElementItem(0))).toBe('Number Input 1')

        await page.fill('input#initialValue', '99')
        expect(await appFrame.inputValue('input >> nth=0')).toBe('99')
    })

    test('select input', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        const app = new App('app1', 'App One', {}, [
            new Page('page_1', 'Control Test Page', {}, [
                new TextInput('textInput_1', 'Name Input', {label:`Name`}),
            ]),
        ])

        await loadApp(page, app)
        expect(await page.textContent(mainPageTreeItem)).toBe('Control Test Page')
        await page.click(mainPageTreeExpand)
        await page.click(mainPageTreeItem)

        await page.click(insertMenu)
        await page.click(insertMenu_SelectInput)
        expect(await page.textContent(treeMainPageElementItem(0))).toBe('Select Input 1')

        await page.fill('input#values', 'Blue, Red')
        await page.fill('input#initialValue', 'Red')
        expect(await appFrame.inputValue('input >> nth=0')).toBe('Red')
    })

    test('true false input', async ({ page }) => {
        await page.goto(runtimeRootUrl)
        const appFrame = page.frame('appFrame') as Frame

        const app = new App('app1', 'App One', {}, [
            new Page('page_1', 'Control Test Page', {}, [
                new TextInput('textInput_1', 'Name Input', {label:`Name`}),
            ]),
        ])

        await loadApp(page, app)
        expect(await page.textContent(mainPageTreeItem)).toBe('Control Test Page')
        await page.click(mainPageTreeExpand)
        await page.click(mainPageTreeItem)

        await page.click(insertMenu)
        await page.click(insertMenu_TrueFalseInput)
        expect(await page.textContent(treeMainPageElementItem(0))).toBe('True False Input 1')

        await page.click('#initialValue')
        await page.click(yesOption)
        expect(await appFrame.isChecked('input >> nth=0')).toBe(true)
    })

    test('new page', async ({ page }) => {
        await page.goto(runtimeRootUrl)

        const app = new App('app1', 'App One', {}, [
            new Page('page_1', 'Control Test Page', {}, [
                new TextInput('textInput_1', 'Name Input', {label:`Name`}),
            ]),
        ])

        await loadApp(page, app)
        expect(await page.textContent(mainPageTreeItem)).toBe('Control Test Page')
        await page.click(mainPageTreeExpand)
        await page.click(mainPageTreeItem)

        await page.click(insertMenu)
        await page.click(insertMenu_Page)
        expect(await page.textContent(treeElementItem(2))).toBe('Page 2')
    })

})
