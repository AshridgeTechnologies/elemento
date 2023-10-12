import React from 'react'
import {Button, DialogContentText, List, ListItem, ListItemButton, ListItemText, Typography} from '@mui/material'
import {EditorActionDialog} from './ActionComponents'
import {
    chooseDirectory,
    doAction,
    internalProject, internalProjectsDir,
    Optional,
    UIManager,
    useDialogState, validateDirectoryForOpen
} from './actionHelpers'
import EditorManager from './EditorManager'
import {DiskProjectStore} from '../DiskProjectStore'



export class OpenState {
    static initialState = () => ({
        names: [] as string[] ,
        namesLoaded: false,
    })

    constructor(private props: {editorManager: EditorManager, uiManager: UIManager},
                private onUpdate: (newState: OpenState) => void,
                private state: {names: string[], namesLoaded: boolean} = OpenState.initialState()) {
        if (!this.state.namesLoaded) {
            internalProjectsDir().then( async (dir) => {
                const result: string[] = []
                // @ts-ignore
                for await (const [name] of dir.entries()) {
                    result.push(name)
                }
                return result
            }).then( this.setNames )
        }
    }

    setNames = (names: string[]) => this.updateWithChanges({names, namesLoaded: true})

    private withChanges(changes: Optional<typeof this.state>) {
        return new OpenState(this.props, this.onUpdate, {...this.state, ...changes})
    }

    private updateWithChanges(changes: Optional<typeof this.state>) {
        this.onUpdate(this.withChanges(changes))
    }

    get names() { return this.state.names }
    get canDoAction() { return true }

    onOpen = () => null
}

export function OpenDialog({editorManager, uiManager}: { editorManager: EditorManager, uiManager: UIManager }) {
    const state = useDialogState(OpenState, editorManager, uiManager)
    const {names, canDoAction, onOpen} = state

    const openProjectFromDisk = async () => {
        const dirHandle = await chooseDirectory()
        if (dirHandle) {
            const error = await validateDirectoryForOpen(dirHandle)
            if (error) {
                uiManager.showAlert('Open project', error, null, 'error')
            } else {
                await editorManager.openProject(dirHandle)
            }
        }
    }

    const title = 'Open project'
    const onOpenAction = doAction(uiManager, title, openProjectFromDisk)
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content='Choose a project stored in the browser'
        fields={<>
            <List dense sx={{maxHeight: 300, overflowY: 'auto', mt: 2, mb: 2}}>
                {names.map( (proj: string, ) => (
                    <ListItemButton key={proj} onClick={doAction(uiManager, title, async () => editorManager.openProject(await internalProject(proj)) )}>
                        <ListItemText primary={proj}/>
                    </ListItemButton>
                ))}
            </List>
            <DialogContentText sx={{borderTop: '1px solid lightgray', pt: 2}}>Or click Choose Folder to open a project on your computer disk</DialogContentText>
        </>}
        action={<Button variant='outlined' onClick={onOpenAction} disabled={!canDoAction}>Choose Folder</Button>}
    />
}
