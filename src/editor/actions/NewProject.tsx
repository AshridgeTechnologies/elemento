import React from 'react'
import Button from '@mui/material/Button'
import {DialogTextField, EditorActionDialog} from './ActionComponents'
import {
    createNewProject,
    doAction,
    onChangeValue,
    Optional,
    UIManager,
    useDialogState,
    validateProjectName
} from './actionHelpers'
import EditorManager from './EditorManager'

export class NewProjectState {
    static initialState = () => ({
        name: '',
        nameError: null
    })

    constructor(private props: {editorManager: EditorManager, uiManager: UIManager},
                private onUpdate: (newState: NewProjectState) => void,
                private state: {name: string | null, nameError: string | null} = NewProjectState.initialState()) {
    }
    setName = (name: string | null) => {
        return validateProjectName(name)
            .then(nameError => this.updateWithChanges({name, nameError}))
    }

    private withChanges(changes: Optional<typeof this.state>) {
        return new NewProjectState(this.props, this.onUpdate, {...this.state, ...changes})
    }

    private updateWithChanges(changes: Optional<typeof this.state>) {
        this.onUpdate(this.withChanges(changes))
    }

    get name() { return this.state.name }
    get nameError() { return this.state.nameError }
    get canDoAction() { return !!(this.name && !this.nameError) }

    onNew = () => createNewProject(this.state.name!, this.props.editorManager)
}

export function NewProjectDialog({editorManager, uiManager}: { editorManager: EditorManager, uiManager: UIManager }) {
    const state = useDialogState(NewProjectState, editorManager, uiManager)
    const {name, nameError, canDoAction, onNew} = state

    const onChangeName = onChangeValue(state.setName)

    const title = 'Create New project'
    const onNewAction = doAction(uiManager, title, onNew)
    return <EditorActionDialog
        onCancel={uiManager.onClose}
        title={title}
        content='Please enter a name for the new project.'
        fields={<>
            <DialogTextField
                autoFocus
                id='projectName'
                label='New project name'
                value={name}
                sx={{minWidth: '25em'}}
                onChange={onChangeName}
                helperText={nameError}/>
        </>}
        action={<Button variant='outlined' onClick={onNewAction} disabled={!canDoAction}>Create</Button>}
    />
}
