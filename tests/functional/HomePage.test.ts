import {expect, test} from '@playwright/test'
import {pageFunctions} from './playwrightHelpers'

const homePageUrl = '/'

test('can access pages from home page', async ({ page }) => {

    const {goto, click} = pageFunctions(page)

    await goto(homePageUrl);
    await click('text="Learn"');
    await expect(page).toHaveURL(/.*\/learn\/?$/);

    await goto(homePageUrl);
    await click('text="Create"');
    await expect(page).toHaveURL(/.*\/studio\/?$/);

    await goto(homePageUrl);
    await click('text="Use"');
    await expect(page).toHaveURL(/.*\/run\/?$/);
})