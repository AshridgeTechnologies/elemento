import React from 'react'
import {expect, test} from '@playwright/experimental-ct-react';
import GetFromGitHubDialog_wrapper from './GetFromGitHubDialog_wrapper'

test.use({ viewport: { width: 800, height: 800 } });

test('should work', async ({ mount, page }) => {

    await page.pause()
    const component = await mount(<GetFromGitHubDialog_wrapper/>)
    await expect(page.locator('.MuiDialog-paper')).toContainText('Please enter the GitHub URL')
})