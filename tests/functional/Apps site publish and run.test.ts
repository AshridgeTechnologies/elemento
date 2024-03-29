import {test, expect, TestInfo} from '@playwright/test'
import {pageFunctions} from './playwrightHelpers.js'
import fs from 'fs'

const fileMenu = 'text=File'
const disabledPublishItem = 'text=Publish - please Login'
const publishMenuItem = 'text=Publish'
const userButton = '[aria-label="account of current user"]'
const emailInput = 'input[name="email"]'
const passwordInput = 'input[name="password"]'
const signInWithEmail = 'text=Sign in with email'
const outsideUserPanel = '[data-testid="userPanel"] div'
const outsideFileMenu = '[data-testid="fileMenu"] div'
const runUrlRegex = /.*\/run\/apps\/\w+\/welcomeToElemento.js$/
const firstText = 'p[id="WelcometoElemento.MainPage.FirstText"]'

const testAccountFile = 'private/testAccount.json'

test('can publish to apps site and run the app', async ({ page , context}, testInfo: TestInfo) => {
    if (!fs.existsSync(testAccountFile)) {
        testInfo.skip(true, `test account details file not found: ${testAccountFile}`)
    }

    const testAccount = JSON.parse(fs.readFileSync(testAccountFile, 'utf8'))
    const {goto, click, fill, press, locator, waitForSelector} = pageFunctions(page)

    await goto('/studio')

    await click(fileMenu)

    await waitForSelector(disabledPublishItem)

    await click(outsideFileMenu)

    await click(userButton)

    await click(signInWithEmail)

    await click(emailInput)

    await fill(emailInput, testAccount.name)

    await press(emailInput, 'Enter')

    await fill(passwordInput, testAccount.password)

    await press(passwordInput, 'Enter')

    await expect(locator('text=Logged in as Tester One')).toBeVisible()

    await click(outsideUserPanel)

    await click(fileMenu)

    await click(publishMenuItem)

    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        await click(`text=${runUrlRegex.toString()}`) // Opens a new tab
    ])
    await newPage.waitForLoadState();

    await expect(newPage).toHaveURL(runUrlRegex)

    await expect(await newPage.textContent(firstText)).toBe('Welcome to Elemento!')
})