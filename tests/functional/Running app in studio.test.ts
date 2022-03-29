import {expect, Frame, Page, test} from '@playwright/test';
import {treeExpand, treeItem} from './playwrightHelpers'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/studio'

let openMainPage = async (page: Page) => {
    await page.click(treeExpand(0))
    await page.click(treeExpand(1))
    await page.click(treeExpand(2))
    expect(await page.textContent(treeItem(5))).toBe('Third Text')
}

const getAppFrame = async (page: Page) => {
    await page.locator('iframe[name="appFrame"]').waitFor();
    return page.frame('appFrame') as Frame
}

test('app shown in frame', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

})

test('Selecting element in editor highlights in the running app', async ({ page }) => {
    await page.goto(runtimeRootUrl)
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
    await page.goto(runtimeRootUrl)
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
    await page.goto(runtimeRootUrl)
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
    await page.goto(runtimeRootUrl)
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
    await page.goto(runtimeRootUrl)
    const appFrame = await getAppFrame(page)
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

    await openMainPage(page)
    await page.click(treeItem(5))
    expect(await page.locator('textarea#content').textContent()).toBe('"Start your program here..."')

    await page.fill('textarea#content', 'Sum(2, 3, 4, 5)')
    expect(await appFrame.textContent('p >> nth=2')).toBe('14')
})
