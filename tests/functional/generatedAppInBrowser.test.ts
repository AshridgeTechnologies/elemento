import {expect, test} from '@playwright/test';
import {projectFixture1, projectFixture2} from '../testutil/projectFixtures'
import App from '../../src/model/App'
import {generate} from '../../src/generator/Generator'

const pageUrl = '/run'

test('welcome app shows elements on page', async ({ page }) => {

    await page.goto(pageUrl)
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')
    expect(await page.textContent('p >> nth=1')).toBe('The future of low code programming')
})

test('can set app on page', async ({ page }) => {

    await page.goto(pageUrl+ '/editorPreview')

    await page.evaluate( (appCode: string) => window.setAppCode(appCode), generate(projectFixture1().elementArray()[0] as App).code)

    expect(await page.textContent('p[id="AppOne.MainPage.FirstText"]')).toBe('The first bit of text')
})

test('shows TextInput elements', async ({ page }) => {

    await page.goto(pageUrl+ '/editorPreview')

    await page.evaluate( (appCode: string) => window.setAppCode(appCode), generate(projectFixture2().elementArray()[0] as App).code)

    expect(await page.inputValue('input[type="text"] >> nth=0')).toBe('A text value')
})

test('can show pages', async ({ page }) => {
    await page.goto(pageUrl+ '/editorPreview')

    await page.evaluate( (appCode: string) => window.setAppCode(appCode), generate(projectFixture2().elementArray()[0] as App).code)
    expect(await page.textContent('p >> nth=0')).toBe('Page One')

    await page.click('button')
    expect(await page.textContent('p >> nth=0')).toBe('Page Two')

    await page.click('button')
    expect(await page.textContent('p >> nth=0')).toBe('Page One')
})

test('can load app from web', async ({ page }) => {
    await page.goto(pageUrl+ '/web/www.dropbox.com/s/vqvwpfub8m4r9ni/AppOne.js?dl=0')
    expect(await page.textContent('p[id="AppOne.MainPage.FirstText"]')).toBe('This is App One')
})

test('shows error if cannot load app from web', async ({ page }) => {
    await page.goto(pageUrl+ '/web/www.dropbox.com/s/xxx/AppOne.js?dl=0')
    expect(await page.textContent('div.MuiAlertTitle-root')).toBe('Invalid app code')
})
