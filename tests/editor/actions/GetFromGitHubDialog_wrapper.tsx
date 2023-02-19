import {GetFromGitHubDialog} from '../../../src/editor/actions/GetFromGitHub'
import React from 'react'

export default function GetFromGitHubDialog_wrapper() {
    return <GetFromGitHubDialog editorManager={{
        getProjectNames: () => Promise.resolve(['Project A', 'Project B']),
        getFromGitHub: () => Promise.resolve()
    }} uiManager={{
        onClose: () => {}, showAlert: () => {}
    }}/>
}