import React from 'react'
import {Button} from '@mui/material'
import {EditorActionDialog} from './ActionComponents'
import {UIManager} from './actionHelpers'
import {RunAppFn} from '../runLocalApp'
import {Para} from '../../docs/HelpComponents'

const goToStudio =  () => window.location.assign(window.location.origin + '/studio')

export function RunGitHubDialog({openProjectFn, uiManager}: { openProjectFn: RunAppFn, uiManager: UIManager }) {
    const title = 'Run app from GitHub'
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content={<>
            <Para>Sorry - this is not available yet.</Para>
            <Para>Please use the Elemento Studio to open the GitHub project and use the
                <b>Run app from GitHub</b> link above the app preview.</Para>
        </>}
        fields={<>
        </>}
        action={<Button variant='outlined' onClick={goToStudio}>Go to Studio</Button>}
    />
}
