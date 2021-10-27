import {expect, test} from '@playwright/test';

test('welcome app shows elements on page', async ({ page }) => {

    // Expects test server such as Parcel dev server running on port 1234
    await page.goto('http://localhost:1234/')
    expect(await page.textContent('p >> nth=0')).toBe('Welcome to Elemento!')
    expect(await page.textContent('p >> nth=1')).toBe('The future of low code programming')
});