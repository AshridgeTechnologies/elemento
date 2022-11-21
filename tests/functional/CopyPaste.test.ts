import {expect, test} from '@playwright/test'
import {loadProject, treeExpand, treeItem, wait} from './playwrightHelpers.js'
import {projectFixture1} from './functionalTestFixtures.js'
import {Page as PWPage} from 'playwright-core'

const pageUrl = '/studio'

const copyMenu = 'text=Copy'
const cutMenu = 'text=Cut'
const pasteAfterMenu = 'text=Paste After'
const pasteBeforeMenu = 'text=Paste Before'
const duplicateMenu = 'text=Duplicate'

let selectMainPage = async function (page: PWPage) {
    expect(await page.textContent(treeItem(0))).toBe('Project One')
    await page.click(treeExpand(0))
    await page.click(treeExpand(1))
    await page.click(treeExpand(2))
    expect(await page.textContent(treeItem(3))).toBe('First Text')
}

test('can copy elements and paste', async ({ page }) => {
    await page.goto(pageUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)
    await page.click(treeItem(3))
    await page.click(treeItem(4), {modifiers: ['Meta']})
    await page.click(treeItem(3), {button: 'right'})
    await page.click(copyMenu)

    await page.click(treeExpand(6))
    await page.click('text=Some Text', {button: 'right'})
    await page.click(pasteAfterMenu)
    await wait()

    expect(await page.textContent(treeItem(7))).toBe('Some Text')
    expect(await page.textContent(treeItem(8))).toBe('First Text')
    expect(await page.textContent(treeItem(9))).toBe('Second Text')
    expect(await page.textContent(treeItem(10))).toBe('More Text')
})

test('can duplicate element', async ({ page }) => {
    await page.goto(pageUrl)
    await loadProject(page, projectFixture1())
    await selectMainPage(page)
    await page.click(treeItem(3), {button: 'right'})
    await page.click(duplicateMenu)

    expect(await page.textContent(treeItem(3))).toBe('First Text')
    expect(await page.textContent(treeItem(4))).toBe('First Text Copy')
    expect(await page.textContent(treeItem(5))).toBe('Second Text')
})

test('can cut and paste element', async ({ page }) => {
    await page.goto(pageUrl)
    await loadProject(page, projectFixture1())

    await wait()
    await selectMainPage(page)

    await wait()
    await page.click(treeItem(4), {button: 'right'})
    await page.click(cutMenu)

    await wait()
    await page.click(treeItem(3), {button: 'right'})
    await page.click(pasteBeforeMenu)

    await wait()
    expect(await page.textContent(treeItem(3))).toBe('Second Text')
    expect(await page.textContent(treeItem(4))).toBe('First Text')
})