import {expect, Frame, Page as PWPage, test} from '@playwright/test';
import {loadProject, treeExpand, treeItem} from './playwrightHelpers.js'
import {el} from './functionalTestFixtures.js'

const pageUrl = '/studio'

const insertMenu = 'text=Insert'
const insertMenu_Button = 'ul[role="menu"] :text("Button")'
const insertMenu_NumberInput = 'ul[role="menu"] :text("Number Input")'
const insertMenu_SelectInput = 'ul[role="menu"] :text("Select Input")'
const insertMenu_TrueFalseInput = 'ul[role="menu"] :text("True False Input")'
const insertMenu_Data = 'ul[role="menu"] :text("Data")'
const insertMenu_Collection = 'ul[role="menu"] :text("Collection")'
const insertMenu_Page = 'ul[role="menu"] :text("Page")'
const yesOption = 'li[role="option"]:text("Yes")'
const switchToFxButton='text=abc'

const getAppFrame = async (page: PWPage) => {
    await page.locator('iframe[name="appFrame"]').waitFor();
    return page.frame('appFrame') as Frame
}

test.describe('Controls can be used', () => {

    const project =
        el("Project", "project1", "Project One", {}, [
            el("App", "app1", "App One", {}, [
                el("Page", "page_1", "Control Test Page", {}, [
                    el("Text", "text_1", "The text", {content: "Some text"})
                ])
            ])
        ])

    let selectControlTestPage = async function (page: PWPage) {
        await page.click(treeExpand(0))
        await page.click(treeExpand(1))
        expect(await page.textContent(treeItem(2))).toBe('Control Test Page')
        await page.click(treeExpand(2))
        await page.click(treeItem(3))
    }

    test('button', async ({ page }) => {
        await page.goto(pageUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_Button)
        expect(await page.textContent(treeItem(4))).toBe('Button 1')

        await page.fill('input#content', 'A button!')

        const appFrame = await getAppFrame(page)
        expect(await appFrame.textContent('button >> nth=0')).toBe('A button!')
    })

    test('number input', async ({ page }) => {
        await page.goto(pageUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_NumberInput)
        expect(await page.textContent(treeItem(4))).toBe('Number Input 1')

        await page.fill('input#initialValue', '99')
        const appFrame = await getAppFrame(page)
        expect(await appFrame.inputValue('input >> nth=0')).toBe('99')
    })

    test('select input', async ({ page }) => {
        await page.goto(pageUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_SelectInput)
        expect(await page.textContent(treeItem(4))).toBe('Select Input 1')

        await page.fill('input#values', 'Blue, Red')
        await page.fill('input#initialValue', 'Red')
        const appFrame = await getAppFrame(page)
        expect(await appFrame.inputValue('input >> nth=0')).toBe('Red')
    })

    test('true false input', async ({ page }) => {
        await page.goto(pageUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_TrueFalseInput)
        expect(await page.textContent(treeItem(4))).toBe('True False Input 1')

        await page.click('#initialValue')
        await page.click(yesOption)
        const appFrame = await getAppFrame(page)
        expect(await appFrame.isChecked('input >> nth=0')).toBe(true)
    })

    test('data', async ({ page }) => {
        await page.goto(pageUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_Data)
        expect(await page.textContent(treeItem(4))).toBe('Data 1')

        await page.fill('input#initialValue', 'Some data')
        await page.click('#display')
        await page.click(yesOption)
        const appFrame = await getAppFrame(page)
        expect(await appFrame.textContent('div[id="AppOne.ControlTestPage.Data1"] code')).toBe(`'Some data'`)
    })

    test('collection', async ({ page }) => {
        await page.goto(pageUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)

        await page.click(insertMenu)
        await page.click(insertMenu_Collection)
        expect(await page.textContent(treeItem(4))).toBe('Collection 1')

        await page.click(switchToFxButton)
        await page.fill('textarea#initialValue', "['green', 'blue']")
        await page.click('#display')
        await page.click(yesOption)
        const appFrame = await getAppFrame(page)
        expect(await appFrame.textContent('div[id="AppOne.ControlTestPage.Collection1"] code')).toBe(`{green: 'green', blue: 'blue'}`)
    })

    test('new page', async ({ page }) => {
        await page.goto(pageUrl)

        await loadProject(page, project)
        await selectControlTestPage(page)
        await page.click(treeItem(2))

        await page.click(insertMenu)
        await page.click(insertMenu_Page)
        expect(await page.textContent(treeItem(4))).toBe('Page 2')
    })

})
