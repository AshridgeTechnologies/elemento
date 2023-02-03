import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react';
import Button from '../../../src/runtime/components/Button';

test.use({ viewport: { width: 500, height: 500 } });

test('should work', async ({ mount }) => {
    const component = await mount(<Button path='button1' content='First Button'/>)
    await expect(component).toContainText('First Button')
})