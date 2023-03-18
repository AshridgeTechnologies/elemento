import React from 'react'
import {Button, InputAdornment, Stack, TextField} from '@mui/material'
import {DialogTextField, EditorActionDialog} from './ActionComponents'
import {
    doAction,
    onChangeValue,
    Optional,
    UIManager,
    useDialogState,
    userCancelledFilePick,
    validateDirectory
} from './actionHelpers'
import EditorManager from './EditorManager'

export class GetFromGitHubState {
    static initialState = () => ({
        url: '',
        directory: null,
        directoryError: null
    })

    constructor(private props: {editorManager: EditorManager, uiManager: UIManager},
                private onUpdate: (newState: GetFromGitHubState) => void,
                private state: {url: string, directory: FileSystemDirectoryHandle | null, directoryError: string | null} = GetFromGitHubState.initialState()) {
    }
    setUrl = (url: string) => this.updateWithChanges({url})
    setDirectory = (directory: FileSystemDirectoryHandle) => {
        return validateDirectory(directory)
            .then(directoryError => this.updateWithChanges({directory, directoryError}))
    }

    private withChanges(changes: Optional<typeof this.state>) {
        return new GetFromGitHubState(this.props, this.onUpdate, {...this.state, ...changes})
    }

    private updateWithChanges(changes: Optional<typeof this.state>) {
        this.onUpdate(this.withChanges(changes))
    }

    get url() { return this.state.url }
    get directory() { return this.state.directory }
    get directoryError() { return this.state.directoryError }
    get canDoAction() { return !!(this.url && this.directory && !this.directoryError) }

    onGet = () => this.props.editorManager.getFromGitHub(this.state.url, this.state.directory!)
}

function DirectoryInput(props: {id: string,
    label: string,
    value: FileSystemDirectoryHandle | null,
    onChange: (dir: FileSystemDirectoryHandle) => void,
    helperText: string | null
}) {

    const chooseDir = () => {
        window.showDirectoryPicker({id: 'elemento_editor', mode: 'readwrite'}).then( props.onChange )
            .catch( e => {
                if (userCancelledFilePick(e)) {
                    return null
                }
                throw e
            })

    }

    const inputProps = {
        readOnly: true,
        endAdornment:
            <InputAdornment position="end">
                <Button aria-label="choose folder" onClick={chooseDir}>Choose</Button>
            </InputAdornment>
    }
    return <Stack direction='row'>
        <TextField
            id = {props.id} label={props.label}
            margin="dense"
            fullWidth
            variant="standard"
            value={props.value?.name ?? ''}
            error={!!props.helperText}
            helperText={props.helperText}
            InputProps={inputProps}
        />
    </Stack>
}

export function GetFromGitHubDialog({editorManager, uiManager}: { editorManager: EditorManager, uiManager: UIManager }) {
    const state = useDialogState(GetFromGitHubState, editorManager, uiManager)
    const {url, directory, directoryError, canDoAction, onGet} = state

    const onChangeUrl = onChangeValue(state.setUrl)
    const onChangeDirectory = state.setDirectory

    const title = 'Get project from GitHub'
    const onGetAction = doAction(uiManager, title, onGet)
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content='Please enter the GitHub URL and a name for the new project.'
        fields={<>
            <DialogTextField
                autoFocus
                id='url'
                label='GitHub URL'
                value={url}
                onChange={onChangeUrl}/>

            <DirectoryInput
                id='projectDirectory'
                label='Folder for new project'
                value={directory}
                onChange={onChangeDirectory}
                helperText={directoryError}/>
        </>}
        action={<Button variant='outlined' onClick={onGetAction} disabled={!canDoAction}>Get</Button>}
    />
}
