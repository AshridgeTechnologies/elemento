import {expect, Page, test, TestInfo} from '@playwright/test'
import {pageFunctions} from './playwrightHelpers.js'
import * as fs from 'fs'

const userButton = '[aria-label="account of current user"]'
const emailInput = 'input[name="email"]'
const passwordInput = 'input[name="password"]'
const signInWithEmail = 'text=Sign in with email'
const outsideUserPanel = '[data-testid="userPanel"] div'
const logoutLink = 'text=Logout'

const testAccountFile = 'private/testAccount.json'

test('can log in and log out', async ({page}: { page: Page }, testInfo: TestInfo) => {
    if (!fs.existsSync(testAccountFile)) {
        testInfo.skip(true, `test account details file not found: ${testAccountFile}`)
    }

    const testAccount = JSON.parse(fs.readFileSync(testAccountFile, 'utf8'))

    const {goto, click, fill, press, locator} = pageFunctions(page)

    await goto('/')

    // Log in
    await click(userButton)

    await click(signInWithEmail)

    await fill(emailInput, testAccount.name)

    await press(emailInput, 'Enter')

    await fill(passwordInput, testAccount.password)

    await press(passwordInput, 'Enter')

    await expect(locator('text=Logged in as Tester One')).toBeVisible()

    // Log out
    await click(outsideUserPanel)

    await click(userButton)

    await click(logoutLink)

    // check logged out
    await click(userButton)

    await expect(locator('text=Please log in')).toBeVisible()

})
