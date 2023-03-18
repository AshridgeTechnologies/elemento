import React from 'react'
import {Button} from '@mui/material'
import {DirectoryInput, EditorActionDialog} from './ActionComponents'
import {doAction, Optional, UIManager, useDialogState, validateDirectory} from './actionHelpers'
import EditorManager from './EditorManager'

export class NewProjectState {
    static initialState = () => ({
        directory: null,
        directoryError: null
    })

    constructor(private props: {editorManager: EditorManager, uiManager: UIManager},
                private onUpdate: (newState: NewProjectState) => void,
                private state: {directory: FileSystemDirectoryHandle | null, directoryError: string | null} = NewProjectState.initialState()) {
    }
    setDirectory = (directory: FileSystemDirectoryHandle) => {
        return validateDirectory(directory)
            .then(directoryError => this.updateWithChanges({directory, directoryError}))
    }

    private withChanges(changes: Optional<typeof this.state>) {
        return new NewProjectState(this.props, this.onUpdate, {...this.state, ...changes})
    }

    private updateWithChanges(changes: Optional<typeof this.state>) {
        this.onUpdate(this.withChanges(changes))
    }

    get directory() { return this.state.directory }
    get directoryError() { return this.state.directoryError }
    get canDoAction() { return !!(this.directory && !this.directoryError) }

    onNew = () => this.props.editorManager.newProject(this.state.directory!)
}

export function NewProjectDialog({editorManager, uiManager}: { editorManager: EditorManager, uiManager: UIManager }) {
    const state = useDialogState(NewProjectState, editorManager, uiManager)
    const {directory, directoryError, canDoAction, onNew} = state

    const onChangeDirectory = state.setDirectory

    const title = 'Create New project'
    const onNewAction = doAction(uiManager, title, onNew)
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content='Please choose a directory to store the files for the new project.'
        fields={<>
            <DirectoryInput
                id='projectDirectory'
                label='Folder for new project'
                value={directory}
                onChange={onChangeDirectory}
                helperText={directoryError}/>
        </>}
        action={<Button variant='outlined' onClick={onNewAction} disabled={!canDoAction}>Create</Button>}
    />
}
