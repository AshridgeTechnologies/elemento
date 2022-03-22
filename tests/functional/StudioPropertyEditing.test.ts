import {expect, Page, test} from '@playwright/test'
import {loadProject, treeExpand, treeItem} from './playwrightHelpers'
import {projectFixture1} from '../testutil/projectFixtures'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

let openMainPage = async function (page: Page) {
    await page.click(treeExpand(0))
    await page.click(treeExpand(1))
    await page.click(treeExpand(2))
    expect(await page.textContent(treeItem(4))).toBe('Second Text')
}

test('can edit element properties', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await loadProject(page, projectFixture1())

    await openMainPage(page)
    await page.click(treeItem(4))
    expect(await page.locator('textarea#content').textContent()).toBe('"The second bit of text"')

    await page.fill('textarea#content', '"This is more text"')
    expect(await page.locator('textarea#content').textContent()).toBe('"This is more text"')

    await page.click(treeItem(3))
    expect(await page.locator('textarea#content').textContent()).toBe('"The first bit of text"')

    await page.click(treeItem(4))
    expect(await page.locator('textarea#content').textContent()).toBe('"This is more text"')
})

test('can edit page properties', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await loadProject(page, projectFixture1())
    await page.click(treeExpand(0))
    await page.click(treeExpand(1))
    expect(await page.textContent(treeItem(3))).toBe('Other Page')

    await page.click(treeItem(3))
    expect(await page.locator('input#name').inputValue()).toBe('Other Page')
    expect(await page.locator('input#style').inputValue()).toBe('')

    await page.fill('input#style', 'color: red')
    expect(await page.locator('input#style').inputValue()).toBe('color: red')

    await page.click(treeItem(2))
    expect(await page.locator('input#name').inputValue()).toBe('Main Page')
    await page.click(treeItem(3))
    expect(await page.locator('input#style').inputValue()).toBe('color: red')
})

test('can edit project properties', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await loadProject(page, projectFixture1())
    expect(await page.textContent(treeItem(0))).toBe('Project One')

    await page.click(treeItem(0))
    expect(await page.locator('input#name').inputValue()).toBe('Project One')
    expect(await page.locator('input#author').inputValue()).toBe('')

    await page.fill('input#author', 'Greene')
    expect(await page.locator('input#author').inputValue()).toBe('Greene')
})