import {expect, test} from '@playwright/test'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'
import appFixture1 from '../util/appFixture1'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

const mainPageTreeItem = `${treeItemSelector} >> nth=0`
const mainPageTreeExpand = `${treeExpandControlSelector} >> nth=0`
const treeMainPageElementItem = (n: number) => `${treeItemSelector} >> nth=${n+1}`
const insertMenu = 'text=Insert'
const insertMenu_Text = 'ul[role="menu"] :text("Text")'

test('can add element as first element when page selected', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    await page.evaluate( (app: string) => window.setAppFromJSONString(app), JSON.stringify(appFixture1()))

    expect(await page.textContent(mainPageTreeItem)).toBe('Main Page')

    await page.click(mainPageTreeExpand)
    expect(await page.textContent(treeMainPageElementItem(0))).toBe('First Text')

    await page.click(mainPageTreeItem)
    await page.click(insertMenu)
    await page.click(insertMenu_Text)
    expect(await page.textContent(treeMainPageElementItem(0))).toBe('Text 5')
    expect(await page.textContent(treeMainPageElementItem(1))).toBe('First Text')
})

test('can add element after selected element', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    await page.evaluate( (app: string) => window.setAppFromJSONString(app), JSON.stringify(appFixture1()))

    await page.click(mainPageTreeExpand)
    expect(await page.textContent(treeMainPageElementItem(0))).toBe('First Text')
    await page.click(treeMainPageElementItem(0))

    await page.click(insertMenu)
    await page.click(insertMenu_Text)
    expect(await page.textContent(treeMainPageElementItem(0))).toBe('First Text')
    expect(await page.textContent(treeMainPageElementItem(1))).toBe('Text 5')
    expect(await page.textContent(treeMainPageElementItem(2))).toBe('Second Text')

    expect(await page.locator('input#id').inputValue()).toBe('text_5')

})