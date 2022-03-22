import {expect, test} from '@playwright/test';
import {appFixture1, appFixture2} from '../testutil/appFixtures'
import {projectFixture1} from '../testutil/projectFixtures'
import App from '../../src/model/App'

// Expects test server such as Parcel dev server running on port 1235 at top level
const runtimeRootUrl = 'http://localhost:1235/'

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
        window.setApp(window.app().set(elementId, 'content', {expr: `"This is Elemento!"`}))
    })

    expect(await page.textContent('p >> nth=0')).toBe('This is Elemento!')

})

test('can replace app on page', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    await page.evaluate( (app: string) => window.setAppFromJSONString(app), JSON.stringify(projectFixture1().elementArray()[0] as App))

    expect(await page.textContent('p >> nth=0')).toBe('The first bit of text')
})

test('shows TextInput elements', async ({ page }) => {

    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    await page.evaluate( (app: string) => window.setAppFromJSONString(app), JSON.stringify(appFixture2()))

    expect(await page.inputValue('input[type="text"] >> nth=0')).toBe('A text value')
})

test('can show pages', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')

    await page.evaluate( (app: string) => window.setAppFromJSONString(app), JSON.stringify(appFixture2()))
    expect(await page.textContent('p >> nth=0')).toBe('Page One')

    await page.click('button')
    expect(await page.textContent('p >> nth=0')).toBe('Page Two')

    await page.click('button')
    expect(await page.textContent('p >> nth=0')).toBe('Page One')
})

test('can load app from web', async ({ page }) => {

    await page.goto(runtimeRootUrl+ 'https://www.dropbox.com/s/x895tpr1aophkan/AppOne.json?dl=0')
    expect(await page.textContent('p >> nth=0')).toBe('This is App One')
})

test('shows error if cannot load app from web', async ({ page }) => {

    await page.goto(runtimeRootUrl+ 'https://www.dropbox.com/s/xxx/AppOne.json?dl=0')
    expect(await page.textContent('div.MuiAlertTitle-root')).toBe('App loading problem')
})
