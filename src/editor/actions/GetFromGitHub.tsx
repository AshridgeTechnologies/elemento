import React from 'react'
import {Button} from '@mui/material'
import {DialogTextField, EditorActionDialog} from './ActionComponents'
import {doAction, onChangeValue, Optional, UIManager, useDialogState, validateProjectName} from './actionHelpers'
import EditorManager from './EditorManager'
import AsyncValue from './AsyncValue'

export class GetFromGitHubState {
    static initialState = () => ({
        url: '',
        projectName: '',
        existingProjectNames: new AsyncValue<Array<string>>()
    })

    constructor(private props: {editorManager: EditorManager, uiManager: UIManager},
                private onUpdate: (newState: GetFromGitHubState) => void,
                private state = GetFromGitHubState.initialState()) {
        this.state.existingProjectNames.init( () => props.editorManager.getProjectNames(), () => this.setNewCopy())
    }

    private projectNameFromUrl(newUrl: string) {
        const nameFromUrl = (url: string) => {
            const urlNoExt = url.replace(/\.g?i?t?$/, '')
            const nameFromUrlRegex = /https:\/\/[^/]+\/[^/]+\/(.+)(\.git)?$/
            return urlNoExt.match(nameFromUrlRegex)?.[1]
        }

        const oldNameFromUrl = nameFromUrl(this.url)
        const nameFromNewUrl = nameFromUrl(newUrl)
        return nameFromNewUrl && this.projectName === '' || this.projectName === oldNameFromUrl ? nameFromNewUrl : this.projectName
    }
    setUrl = (url: string) => this.updateWithChanges({url, projectName: this.projectNameFromUrl(url)})
    setProjectName = (projectName: string) => this.updateWithChanges({projectName})

    private setNewCopy() {
        this.updateWithChanges({})
    }

    private withChanges(changes: Optional<typeof this.state>) {
        return new GetFromGitHubState(this.props, this.onUpdate, {...this.state, ...changes})
    }

    private updateWithChanges(changes: Optional<typeof this.state>) {
        this.onUpdate(this.withChanges(changes))
    }

    get url() { return this.state.url }
    get projectName() { return this.state.projectName }
    private get existingProjectNames() { return this.state.existingProjectNames.value }

    get error() { return validateProjectName(this.projectName, this.existingProjectNames ?? []) }
    get canCreate() { return !!(this.url && this.projectName && !this.error) }

    onGet = () => this.props.editorManager.getFromGitHub(this.state.url, this.state.projectName)
}

export function GetFromGitHubDialog({editorManager, uiManager}: { editorManager: EditorManager, uiManager: UIManager }) {
    const state = useDialogState(GetFromGitHubState, editorManager, uiManager)
    const {url, projectName, error, canCreate, onGet} = state

    const onChangeUrl = onChangeValue(state.setUrl)
    const onChangeProjectName = onChangeValue(state.setProjectName)

    const title = 'Get project from GitHub'
    const onGetAction = doAction(uiManager, title, onGet)
    return <EditorActionDialog
        onClose={uiManager.onClose} title={title}
        content='Please enter the GitHub URL and a name for the new project.'
        fields={<>
            <DialogTextField
                autoFocus
                id="url"
                label="GitHub URL"
                value={url}
                onChange={onChangeUrl}/>
            <DialogTextField
                id="projectName"
                label="Project Name"
                value={projectName}
                onChange={onChangeProjectName}
                helperText={error}/>
        </>}
        action={<Button variant='outlined' onClick={onGetAction} disabled={!canCreate}>Get</Button>}
    />
}
