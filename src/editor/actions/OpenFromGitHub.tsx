import React from 'react'
import {Button} from '@mui/material'
import {DialogTextField, EditorActionDialog} from './ActionComponents'
import {doAction, onChangeValue, openFromGitHub, Optional, UIManager, useDialogState} from './actionHelpers'
import EditorManager from './EditorManager'


export class OpenFromGitHubState {
    static initialState = () => ({
        url: '',
    })

    constructor(private props: {editorManager: EditorManager, uiManager: UIManager},
                private onUpdate: (newState: OpenFromGitHubState) => void,
                private state: {url: string} = OpenFromGitHubState.initialState()) {
    }
    setUrl = (url: string) => this.updateWithChanges({url})

    private withChanges(changes: Optional<typeof this.state>) {
        return new OpenFromGitHubState(this.props, this.onUpdate, {...this.state, ...changes})
    }

    private updateWithChanges(changes: Optional<typeof this.state>) {
        this.onUpdate(this.withChanges(changes))
    }

    get url() { return this.state.url }
    get canDoAction() { return !!(this.url) }

    onOpen = () => openFromGitHub(this.url, this.props.editorManager)
}

export function OpenFromGitHubDialog({editorManager, uiManager}: { editorManager: EditorManager, uiManager: UIManager }) {
    const state = useDialogState(OpenFromGitHubState, editorManager, uiManager)
    const {url, canDoAction, onOpen} = state

    const onChangeUrl = onChangeValue(state.setUrl)

    const title = 'Open project from GitHub'
    const onOpenAction = doAction(uiManager, title, onOpen)
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content='Please enter the GitHub URL'
        fields={<>
            <DialogTextField
                autoFocus
                id='url'
                label='GitHub URL'
                value={url}
                sx={{minWidth: '34em'}}
                onChange={onChangeUrl}/>
        </>}
        action={<Button variant='outlined' onClick={onOpenAction} disabled={!canDoAction}>Open</Button>}
    />
}
