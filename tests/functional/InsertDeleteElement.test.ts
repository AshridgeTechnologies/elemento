import {expect, test} from '@playwright/test'
import {loadProject, treeExpand, treeItem} from './playwrightHelpers'
import {projectFixture1} from '../testutil/projectFixtures'
import {Page as PWPage} from 'playwright-core'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/studio'

const insertMenu = 'text=Insert'
const insertMenu_Text = 'ul[role="menu"] :text("Text")'
const contextMenu_Delete = 'ul[role="menu"] :text("Delete")'
const confirmMenu_Yes = 'ul[role="menu"] :text("Yes")'

let selectMainPage = async function (page: PWPage) {
    expect(await page.textContent(treeItem(0))).toBe('Project One')
    await page.click(treeExpand(0))
    await page.click(treeExpand(1))
    await page.click(treeExpand(2))
    expect(await page.textContent(treeItem(3))).toBe('First Text')
}


test('can add element as first element when page selected', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)
    await page.click(treeItem(2))

    await page.click(insertMenu)
    await page.click(insertMenu_Text)
    expect(await page.textContent(treeItem(3))).toBe('Text 5')
    expect(await page.textContent(treeItem(4))).toBe('First Text')
})

test('can add element after selected element', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)
    await page.click(treeItem(3))

    await page.click(insertMenu)
    await page.click(insertMenu_Text)
    expect(await page.textContent(treeItem(3))).toBe('First Text')
    expect(await page.textContent(treeItem(4))).toBe('Text 5')
    expect(await page.textContent(treeItem(5))).toBe('Second Text')

    expect(await page.locator('input#id').inputValue()).toBe('text_5')
})

test('can delete element', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)

    await page.click(treeItem(3), {button: 'right'})
    await page.click(contextMenu_Delete)
    await page.click(confirmMenu_Yes)

    expect(await page.textContent(treeItem(3))).toBe('Second Text')
})