import {Frame, Page, test} from '@playwright/test'
import {waitUntil} from './playwrightHelpers.js'

const getAppFrame = (page: Page): Promise<Frame> => waitUntil(() => page.frame('appFrame') as Frame)

test.skip('test', async ({ page }) => {

    // Go to http://localhost:1234/studio
    await page.goto('http://localhost:1234/studio');

    // Click text=File
    await page.click('text=File');

    // Click text=Open
    await page.click('text=Open');

    const appFrame = await getAppFrame(page)

    // Click input[type="text"]
    await appFrame.click('input[type="text"]');

    // Fill input[type="text"]
    await appFrame.fill('input[type="text"]', 'My new Widget');

    // Click input[type="number"]
    await appFrame.click('input[type="number"]');

    // Fill input[type="number"]
    await appFrame.fill('input[type="number"]', '10');

    // Check input[type="checkbox"]
    await appFrame.check('input[type="checkbox"]');

    // Click text=Add Widget
    await appFrame.click('text=Add Widget');

    // Click button:has-text("New Widget")
    await appFrame.click('button:has-text("New Widget")');

    // Click input[type="text"]
    await appFrame.click('input[type="text"]');

    // Fill input[type="text"]
    await appFrame.fill('input[type="text"]', 'Widget Two');

    // Click input[type="number"]
    await appFrame.click('input[type="number"]');

    // Fill input[type="number"]
    await appFrame.fill('input[type="number"]', '22.2');

    // Click text=Add Widget
    await appFrame.click('text=Add Widget');

    // Click div[role="button"]:has-text("My new Widget")
    await appFrame.click('div[role="button"]:has-text("My new Widget")');

    // Click input[type="text"]
    await appFrame.click('input[type="text"]');

    // Click input[type="number"]
    await appFrame.click('input[type="number"]');

    // Uncheck input[type="checkbox"]
    await appFrame.uncheck('input[type="checkbox"]');

    // Click input[type="number"]
    await appFrame.click('input[type="number"]');

    // Click input[type="number"]
    await appFrame.click('input[type="number"]');

    // Fill input[type="number"]
    await appFrame.fill('input[type="number"]', '12');

    // Click text=Save Changes
    await appFrame.click('text=Save Changes');

    // Click div[role="button"]:has-text("Widget Two")
    await appFrame.click('div[role="button"]:has-text("Widget Two")');

    // Click text=Save As
    await appFrame.click('text=Save As');

    // Click text=New File
    await appFrame.click('text=New File');

    // Click text=Open File
    await appFrame.click('text=Open File');

    // Click div[role="button"]:has-text("My new Widget")
    await appFrame.click('div[role="button"]:has-text("My new Widget")');

    // Click text=Delete
    await appFrame.click('text=Delete');

    // Click div[role="button"]:has-text("Widget Two")
    await appFrame.click('div[role="button"]:has-text("Widget Two")');

});