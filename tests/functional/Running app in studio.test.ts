import {expect, Frame, test} from '@playwright/test';
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

test('app shown in frame', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    const appFrame = page.frame('appFrame') as Frame
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

})

test('Changes to app definition show immediately in the running app', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    const appFrame = page.frame('appFrame') as Frame
    expect(await appFrame.textContent('p >> nth=2')).toBe('Start your program here...')

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(`${treeItemSelector} >> nth=3`)).toBe('Third Text')

    await page.click(`${treeItemSelector} >> nth=3`)
    expect(await page.locator('input#content').inputValue()).toBe('"Start your program here..."')

    await page.fill('input#content', '"Get started now!"')
    expect(await page.locator('input#content').inputValue()).toBe('"Get started now!"')

    expect(await appFrame.textContent('p >> nth=2')).toBe('Get started now!')
} )

