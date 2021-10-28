import {expect, test} from '@playwright/test';

// Expects test server such as Parcel dev server running on port 1234
const rootUrl = 'http://localhost:1234/'

test('welcome app shows elements on page', async ({ page }) => {

    await page.goto(rootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')
    expect(await page.textContent('p >> nth=1')).toBe('The future of low code programming')
})

test('can update app on page', async ({ page }) => {

    await page.goto(rootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    await page.evaluate(()=> {
        // @ts-ignore
        window.appModel.pages[0].elements[0].contentExpr = '"This is Elemento!"'
        // @ts-ignore
        window.runApp(window.appModel)
    })

    expect(await page.textContent('p >> nth=0')).toBe('This is Elemento!')

})