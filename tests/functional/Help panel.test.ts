import {expect, test} from '@playwright/test'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'

const helpButton = 'button#help'
const helpPanel = '#helpPanel'
const helpPanelTitle = `${helpPanel} h1`
const helpPanelText = `${helpPanel} .helpText`
const helpPanelClose = `${helpPanel} .closeButton`

test('open help panel and hide it', async ({ page }) => {
    await page.goto(runtimeRootUrl)

    expect(await(page.isHidden(helpPanel))).toBe(true)
    await page.click(helpButton)

    expect(await(page.isVisible(helpPanel))).toBe(true)
    expect(await page.textContent(helpPanelTitle)).toBe('Help')

    await page.click(helpPanelClose)
    expect(await(page.isHidden(helpPanel))).toBe(true)
})

test('help panel contents scrolls to help item', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await page.click(helpButton)

    const testHelpItemTitle = 'Controls'
    const testHelpItemContentLink = `${helpPanel} .helpContent >> text=${testHelpItemTitle}`
    const testHelpItem = `${helpPanelText} >> text=${testHelpItemTitle}`

    await page.click(testHelpItemContentLink)
    expect(await page.isVisible(testHelpItem)).toBe(true)

    const isScrolledToTopInPage = (idArg:string) => {
        const [container, el] = idArg.split('|')
        const containerPos = document.querySelector(container)!.getBoundingClientRect().top
        const elementPos = document.querySelector(el)!.getBoundingClientRect().top

        const difference = elementPos - containerPos
        const result = difference > 0 && difference < 20
        // console.log(containerPos, elementPos, difference, result)
        return result
    }

    await page.waitForFunction(isScrolledToTopInPage, `${helpPanelText}|#help-controls`, {timeout: 3000})

})
