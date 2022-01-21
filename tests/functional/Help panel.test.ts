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

    await expect(page.locator(helpPanel)).toBeHidden()
    await page.click(helpButton)

    await expect(page.locator(helpPanel)).toBeVisible()
    await expect(page.locator(helpPanelTitle)).toHaveText('Help')

    await page.click(helpPanelClose)
    await expect(page.locator(helpPanel)).toBeHidden()
})

test('help panel contents scrolls to help item', async ({ page }) => {
    await page.goto(runtimeRootUrl)
    await page.click(helpButton)

    const testHelpItemTitle = 'Controls'
    const testHelpItemContentLink = `${helpPanel} .helpContent >> text=${testHelpItemTitle}`
    const testHelpItem = `${helpPanelText} h4:text-is("${testHelpItemTitle}")`

    await page.click(testHelpItemContentLink)
    await expect(page.locator(testHelpItem)).toBeVisible()

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
