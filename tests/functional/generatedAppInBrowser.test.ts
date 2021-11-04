import {expect, test} from '@playwright/test';

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
        const elementId = window.appModel.pages[0].elements[0].id
        // @ts-ignore
        window.appModel = window.appModel.set(elementId, 'contentExpr', '"This is Elemento!"')
        // @ts-ignore
        window.runApp(window.appModel)
    })

    expect(await page.textContent('p >> nth=0')).toBe('This is Elemento!')

})