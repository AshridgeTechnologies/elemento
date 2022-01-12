import {expect, test} from '@playwright/test'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

const helpButton = 'button#help'
const helpPanel = '#helpPanel'
const helpPanelTitle = `${helpPanel} h1`
const helpPanelClose = `${helpPanel} .closeButton`

test('open help panel and hide it', async ({ page }) => {
    await page.goto(runtimeRootUrl)

    expect(await(page.isHidden(helpPanel)))
    await page.click(helpButton)

    expect(await(page.isVisible(helpPanel)))
    expect(await page.textContent(helpPanelTitle)).toBe('Help')

    await page.click(helpPanelClose)
    expect(await(page.isHidden(helpPanel)))
})
