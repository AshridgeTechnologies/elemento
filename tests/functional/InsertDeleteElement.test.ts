import {expect, test} from '@playwright/test'
import {loadProject, treeExpand, treeItem} from './playwrightHelpers'
import {projectFixture1} from '../testutil/projectFixtures'
import {Page as PWPage} from 'playwright-core'

const pageUrl = '/studio'

const insertInsideMenu = 'text=Insert inside'
const insertAfterMenu = 'text=Insert after'
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

test('can add element inside when right click on Page', async ({ page }) => {
    await page.goto(pageUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)
    await page.click(treeItem(2), {button: 'right'})

    await page.click(insertInsideMenu)
    await page.click(insertMenu_Text)
    expect(await page.textContent(treeItem(3))).toBe('First Text')
    expect(await page.textContent(treeItem(6))).toBe('Text 5')
})

test('can add element after selected element', async ({ page }) => {
    await page.goto(pageUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)
    await page.click(treeItem(3), {button: 'right'})

    await page.click(insertAfterMenu)
    await page.click(insertMenu_Text)
    expect(await page.textContent(treeItem(3))).toBe('First Text')
    expect(await page.textContent(treeItem(4))).toBe('Text 5')
    expect(await page.textContent(treeItem(5))).toBe('Second Text')

    expect(await page.locator('[data-testid="elementId"]').textContent()).toBe('text_5')
})

test('can delete element', async ({ page }) => {
    await page.goto(pageUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)

    await page.click(treeItem(3), {button: 'right'})
    await page.click(contextMenu_Delete)
    await page.click(confirmMenu_Yes)

    expect(await page.textContent(treeItem(3))).toBe('Second Text')
})