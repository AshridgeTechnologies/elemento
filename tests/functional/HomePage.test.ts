import {expect, test} from '@playwright/test'
import {pageFunctions} from './playwrightHelpers'

const homePageUrl = '/'

test('can log in and log out', async ({ page }) => {

    const {goto, click} = pageFunctions(page)

    await goto(homePageUrl);
    await click('text=Create Apps');
    await expect(page).toHaveURL(/.*\/studio\/?$/);

    await goto(homePageUrl);
    await click('text=Run Apps');
    await expect(page).toHaveURL(/.*\/run\/?$/);
})