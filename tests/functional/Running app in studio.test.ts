import {expect, Frame, test} from '@playwright/test';
import appFixture1 from '../util/appFixture1'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

let theApp = appFixture1()

test('app shown in frame', async ({ page }) => {
    test.fail()
    await page.goto(runtimeRootUrl)
    const appFrame = page.frame('appFrame') as Frame
    expect(await appFrame.textContent('p >> nth=2')).toBe('Some text here')

})

test('app changes update running app immediately', async ({ page }) => {
    test.fail()
    await page.goto(runtimeRootUrl)
    const appFrame = page.frame('appFrame') as Frame
    expect(await appFrame.textContent('p >> nth=2')).toBe('Some text here')
})

