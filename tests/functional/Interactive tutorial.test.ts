import {ElementHandle, expect, Frame, test} from '@playwright/test'
import {treeExpandControlSelector, treeItem, treeItemSelector} from '../editor/Selectors'
import {appFixture1} from '../util/appFixtures'

// Expects test server such as Parcel dev server running on port 1234
const autorunRootUrl = 'http://localhost:1234/autorun/index.html'


async function isHighlighted(selector: string) {
    return false
}

test('Shows autorun with steps and description and navigates', async ({ page }) => {
    test.fail(true, "In progress")
    async function isHighlighted(selector: string) {
        return false
    }

    await page.goto(autorunRootUrl)
    //await page.evaluate( (app: string) => window.setTargetFromJSONString(app), JSON.stringify(editorAutorunFixture1()))

    const targetFrame = page.frame('targetFrame') as Frame

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(treeItem(1))).toBe('Introduction')
    expect(await isHighlighted(treeItem(1)))
    expect(await page.textContent(`#stepTitle`)).toBe('Introduction')
    expect(await page.textContent(`#stepDescription`)).toBe('We are going to see how things work')

    await page.click(`#nextStep`)

    expect(await page.textContent(treeItem(2))).toBe('Navigation panel')
    expect(await isHighlighted(treeItem(2)))
    expect(await page.textContent(`#stepTitle`)).toBe('Navigation panel')
    expect(await page.textContent(`#stepDescription`)).toBe('This shows where you are')

    await page.click(`#prevStep`)

    expect(await isHighlighted(treeItem(1)))
    expect(await page.textContent(`#stepTitle`)).toBe('Introduction')
    expect(await page.textContent(`#stepDescription`)).toBe('We are going to see how things work')


} )
