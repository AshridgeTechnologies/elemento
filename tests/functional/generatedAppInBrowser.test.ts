import {expect, test} from '@playwright/test';
import {appFixture1, appFixture2} from '../util/appFixtures'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/runtime/app.html'

test('welcome app shows elements on page', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')
    expect(await page.textContent('p >> nth=1')).toBe('The future of low code programming')
})

test('can update app on page', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    await page.evaluate(()=> {
        // @ts-ignore
        const elementId = window.app().pages[0].elements[0].id
        // @ts-ignore
        window.setApp(window.app().set(elementId, 'contentExpr', '"This is Elemento!"'))
    })

    expect(await page.textContent('p >> nth=0')).toBe('This is Elemento!')

})

test('can replace app on page', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    await page.evaluate( (app: string) => window.setAppFromJSONString(app), JSON.stringify(appFixture1()))

    expect(await page.textContent('p >> nth=0')).toBe('The first bit of text')
})

test('shows TextInput elements', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    await page.evaluate( (app: string) => window.setAppFromJSONString(app), JSON.stringify(appFixture2()))

    expect(await page.inputValue('input[type="text"] >> nth=0')).toBe('A text value')
})
