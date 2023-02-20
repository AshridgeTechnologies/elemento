import React from 'react'
import {GetFromGitHubDialog} from '../../../src/editor/actions/GetFromGitHub'
import EditorManager from '../../../src/editor/actions/EditorManager'

export default function GetFromGitHubDialog_wrapper() {
    const editorManager = {
        getProjectNames: () => Promise.resolve(['Project A', 'Project B']),
        getFromGitHub: () => Promise.resolve(),
    } as unknown as EditorManager

    const uiManager = {
        onClose: () => {}, showAlert: () => {}
    }
    return <GetFromGitHubDialog editorManager={editorManager} uiManager={uiManager}/>
}