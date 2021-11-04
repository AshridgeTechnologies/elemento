import {expect, test} from '@playwright/test';

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

test('can edit element properties', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('button.rct-tree-item-button >> nth=0')).toBe('Main Page')

    await page.click('.rct-tree-item-arrow-hasChildren')
    expect(await page.textContent('button.rct-tree-item-button >> nth=2')).toBe('Second Text')

    await page.click('button.rct-tree-item-button >> nth=2')
    expect(await page.locator('input#content').inputValue()).toBe('"The second bit of text"')

    await page.fill('input#content', '"This is more text"')
    expect(await page.locator('input#content').inputValue()).toBe('"This is more text"')

    await page.click('button.rct-tree-item-button >> nth=1')
    expect(await page.locator('input#content').inputValue()).toBe('"The first bit of text"')

    await page.click('button.rct-tree-item-button >> nth=2')
    expect(await page.locator('input#content').inputValue()).toBe('"This is more text"')

})

test('can edit page properties', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('button.rct-tree-item-button >> nth=1')).toBe('Other Page')

    await page.click('button.rct-tree-item-button >> nth=1')
    expect(await page.locator('input#name').inputValue()).toBe('Other Page')
    expect(await page.locator('input#style').inputValue()).toBe('')

    await page.fill('input#style', 'color: red')
    expect(await page.locator('input#style').inputValue()).toBe('color: red')

    await page.click('button.rct-tree-item-button >> nth=0')
    expect(await page.locator('input#name').inputValue()).toBe('Main Page')
    await page.click('button.rct-tree-item-button >> nth=1')
    expect(await page.locator('input#style').inputValue()).toBe('color: red')
})