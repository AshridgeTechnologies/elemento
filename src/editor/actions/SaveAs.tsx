import React from 'react'
import {Button} from '@mui/material'
import {DirectoryInput, EditorActionDialog} from './ActionComponents'
import {doAction, Optional, UIManager, useDialogState, validateDirectory} from './actionHelpers'
import EditorManager from './EditorManager'
import {DiskProjectStore} from '../DiskProjectStore'

export class SaveAsState {
    static initialState = () => ({
        directory: null,
        directoryError: null
    })

    constructor(private props: {editorManager: EditorManager, uiManager: UIManager},
                private onUpdate: (newState: SaveAsState) => void,
                private state: {directory: FileSystemDirectoryHandle | null, directoryError: string | null} = SaveAsState.initialState()) {
    }
    setDirectory = (directory: FileSystemDirectoryHandle | null) => {
        return validateDirectory(directory)
            .then(directoryError => this.updateWithChanges({directory, directoryError}))
    }

    private withChanges(changes: Optional<typeof this.state>) {
        return new SaveAsState(this.props, this.onUpdate, {...this.state, ...changes})
    }

    private updateWithChanges(changes: Optional<typeof this.state>) {
        this.onUpdate(this.withChanges(changes))
    }

    get directory() { return this.state.directory }
    get directoryError() { return this.state.directoryError }
    get canDoAction() { return !!(this.directory && !this.directoryError) }

    onSave = (currentProjectStore: DiskProjectStore) => this.props.editorManager.saveProjectAs(this.state.directory!, currentProjectStore)
}

export function SaveAsDialog({editorManager, uiManager, currentProjectStore}: { editorManager: EditorManager, uiManager: UIManager, currentProjectStore: DiskProjectStore }) {
    const state = useDialogState(SaveAsState, editorManager, uiManager)
    const {directory, directoryError, canDoAction, onSave: saveFn} = state
    const onSave = () => state.onSave(currentProjectStore)

    const onChangeDirectory = state.setDirectory

    const title = 'Save project as'
    const onSaveAction = doAction(uiManager, title, onSave)
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content='Please choose a folder to store the files for the new copy of this project.'
        fields={<>
            <DirectoryInput
                id='projectDirectory'
                label='Folder for new copy'
                value={directory}
                onChange={onChangeDirectory}
                helperText={directoryError}/>
        </>}
        action={<Button variant='outlined' onClick={onSaveAction} disabled={!canDoAction}>Save</Button>}
    />
}
