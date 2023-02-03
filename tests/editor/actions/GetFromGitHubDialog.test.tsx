import React from 'react'
import { test, expect } from '@playwright/experimental-ct-react';
import EditorManager from '../../../src/editor/actions/EditorManager'
import {UIManager} from '../../../src/editor/actions/actionHelpers'
import {GetFromGitHubDialog} from '../../../src/editor/actions/GetFromGitHub'

test.use({ viewport: { width: 800, height: 800 } });

test('should work', async ({ mount }) => {
    let editorManager: EditorManager
    let uiManager: UIManager

        editorManager = {
            getProjectNames: () => Promise.resolve(['Project A', 'Project B']),
            getFromGitHub: () => Promise.resolve()
        } as unknown as EditorManager

        uiManager = {
            onClose: () => {}, showAlert: () => {}
        } as UIManager

    const component = await mount(<GetFromGitHubDialog editorManager={{
        getProjectNames: () => Promise.resolve(['Project A', 'Project B']),
        getFromGitHub: () => Promise.resolve()
    }} uiManager={{
        onClose: () => {}, showAlert: () => {}
    }}/>)
    await expect(component).toContainText('Please enter the GitHub URL')
})