import {expect, Frame, Page, test} from '@playwright/test';
import {loadProject, treeExpand, treeItem, treeItemText} from './playwrightHelpers'
import {waitUntil} from '../testutil/testHelpers'
import {projectFixtureWithList} from '../testutil/projectFixtures'

const pageUrl = '/studio'

let openMainPage = async (page: Page) => {
    await page.click(treeExpand(0))
    await page.click(treeExpand(1))
    await page.click(treeExpand(2))
}

const getAppFrame = (page: Page): Promise<Frame> => waitUntil(() => page.frame('appFrame') as Frame)

test('Selecting list element in editor or running app highlights in the running app', async ({ page }) => {
    test.skip(true, 'Only works when run headed for some reason');
    const item1para1 = 'li >> nth=0 >> p >> nth=0'
    const item1para2 = 'li >> nth=0 >> p >> nth=1'

    await page.goto(pageUrl)
    await loadProject(page, projectFixtureWithList())

    const getOutlineStyle = async (selector: string) => page.evaluate((el: any) => getComputedStyle(el).outlineStyle, await appFrame.$(selector))

    expect(await (await getAppFrame(page)).textContent(item1para1)).toBe('Hi there!')
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent(item1para2)).toBe('This is gre')

    await openMainPage(page)
    await page.click(treeExpand(3))

    await page.click(treeItemText('Text 1'))
    expect(await page.locator('textarea#content').textContent()).toBe('Hi there!')
    expect(await getOutlineStyle(item1para1)).not.toBe('none')

    await appFrame.click(item1para2, {modifiers: ['Alt']})
    expect(await page.locator('textarea#content').textContent()).toBe(`"This is " + Left($item.color, 3)`)
    expect(await getOutlineStyle(item1para1)).toBe('none')
    expect(await getOutlineStyle(item1para2)).not.toBe('none')
} )

test('app shown in frame', async ({ page }) => {
    await page.goto(pageUrl)
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')
})

test('Selecting element in editor or running app highlights in the running app', async ({ page }) => {
    await page.goto(pageUrl)
    const appFrame = await getAppFrame(page)
    const getOutlineStyle = async (selector: string) => page.evaluate((el: any) => getComputedStyle(el).outlineStyle, await appFrame.$(selector))

    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

    await openMainPage(page)

    await page.click(treeItem(5))
    expect(await page.locator('textarea#content').textContent()).toBe('"Start your program here..."')
    expect(await getOutlineStyle('p >> nth=2')).not.toBe('none')

    await appFrame.click('p >> nth=0', {modifiers: ['Alt']})
    expect(await page.locator('textarea#content').textContent()).toBe('"Welcome to Elemento!"')
    expect(await getOutlineStyle('p >> nth=2')).toBe('none')
    expect(await getOutlineStyle('p >> nth=0')).not.toBe('none')
} )

test('Changes to app definition show immediately in the running app', async ({ page }) => {
    await page.goto(pageUrl)
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

    await openMainPage(page)

    await page.click(treeItem(5))
    expect(await page.locator('textarea#content').textContent()).toBe('"Start your program here..."')

    await page.fill('textarea#content', '"Get started now!"')
    expect(await page.locator('textarea#content').textContent()).toBe('"Get started now!"')

    expect(await appFrame.textContent('p >> nth=2')).toBe('Get started now!')
} )

test('Formulas in app definition update the running app immediately', async ({ page })=> {
    await page.goto(pageUrl)
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

    await openMainPage(page)

    await page.click(treeItem(5))
    expect(await page.locator('textarea#content').textContent()).toBe('"Start your program here..."')

    await page.fill('textarea#content', '23 + 45')
    expect(await appFrame.textContent('p >> nth=2')).toBe('68')

    await page.fill('textarea#content', '23 + 45 + " things"')
    expect(await appFrame.textContent('p >> nth=2')).toBe('68 things')
})
test('Invalid formula in app definition shows empty content in the running app until corrected', async ({ page })=> {
    await page.goto(pageUrl)
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')
    await openMainPage(page)

    await page.click(treeItem(5))
    expect(await page.locator('textarea#content').textContent()).toBe('"Start your program here..."')

    await page.fill('textarea#content', '23 +')
    expect(await appFrame.textContent('p >> nth=2')).toBe('')

    await page.fill('textarea#content', '23 + 45')
    expect(await appFrame.textContent('p >> nth=2')).toBe('68')
})

test('Global functions can be used in formulas', async ({ page })=> {
    await page.goto(pageUrl)
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

    await openMainPage(page)
    await page.click(treeItem(5))
    expect(await page.locator('textarea#content').textContent()).toBe('"Start your program here..."')

    await page.fill('textarea#content', 'Sum(2, 3, 4, 5)')
    expect(await appFrame.textContent('p >> nth=2')).toBe('14')
})
