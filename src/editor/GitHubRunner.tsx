import React, {ChangeEvent, useState} from 'react'
import {ThemeProvider} from '@mui/material/styles'
import {
    Alert,
    AlertColor,
    AlertTitle,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material'
import Project from '../model/Project'
import {theme} from '../shared/styling'
import {LocalProjectStore, LocalProjectStoreIDB} from './LocalProjectStore'
import GitProjectStore, {isGitWorkingCopy} from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {gitHubAccessToken, gitHubUsername, isSignedIn, signIn} from '../shared/authentication'
import {GetFromGitHubDialog} from './actions/GetFromGitHub'
import {CloseButton} from './actions/ActionComponents'
import {UIManager} from './actions/actionHelpers'
import EditorManager from './actions/EditorManager'


declare global {
    var getProject: () => Project
}
function CreateGitHubRepoDialog({onCreate, onClose, defaultName}: { onCreate: (repoName: string) => Promise<void>, onClose: VoidFunction, defaultName: string }) {
    const [repoName, setRepoName] = useState<string>(defaultName)
    const onChangeRepoName = (event: ChangeEvent) => setRepoName((event.target as HTMLInputElement).value)
    const canCreate = !!repoName

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Create GitHub repository <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a name for the new repository
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="repositoryName"
                    label="Repository name"
                    fullWidth
                    variant="standard"
                    value={repoName}
                    onChange={onChangeRepoName}
                />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={() => onCreate(repoName)} disabled={!canCreate}>Create</Button>
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

function CommitDialog({onCommit, onClose}: { onCommit: (commitMessage: string) => Promise<void>, onClose: VoidFunction }) {
    const [commitMessage, setCommitMessage] = useState<string>('')
    const onChangeCommitMessage = (event: ChangeEvent) => setCommitMessage((event.target as HTMLInputElement).value)
    const canCommit = !!commitMessage

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Save to GitHub <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a description of the changes made
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="commitMessage"
                    label="Changes made"
                    fullWidth
                    variant="standard"
                    value={commitMessage}
                    onChange={onChangeCommitMessage}
                />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={() => onCommit(commitMessage)} disabled={!canCommit}>Save</Button>
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

export default function GitHubRunner({projectName, action, editorId}: {projectName: string, action: string, editorId: string}) {
    const [localProjectStore] = useState<LocalProjectStore>(new LocalProjectStoreIDB())
    const [message, setMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const [actionState, setActionState] = useState<null | 'inProgress' | 'done'>(null)
    const removeDialog = () => {
        setDialog(null)
        setActionState('done')
    }

    const getFromGitHub = () => {
        const uiManager = new UIManager({onClose: removeDialog, showAlert: showMessage, editorId})
        return setDialog(<GetFromGitHubDialog editorManager={new EditorManager(localProjectStore)}
                                              uiManager={uiManager}/>)
    }

    const updateFromGitHub = async() => {
        console.log('Update from GitHub')
        const fs = localProjectStore.fileSystem
        const store =  new GitProjectStore(fs, http)
        try {
            const uiManager = new UIManager({onClose: removeDialog, showAlert: showMessage, editorId})
            showMessage('Updating from GitHub', projectName, null, 'info')
            await store.pull(projectName)
            uiManager.sendMessageToEditor({type: 'updateProject', projectName})
            showMessage('Project updated from GitHub', projectName, null, 'success')
        } catch(e: any) {
            console.error('Error in pull', e)
            showMessage('Problem updating from GitHub', projectName, `Message: ${e.message}`, 'error')
        }
        setActionState('done')
    }

    function pushToGitHub(gitProjectStore: GitProjectStore) {
        const onPush = async (commitMessage: string) => {
            try {
                await gitProjectStore.commitAndPush(projectName, commitMessage)
                showMessage(`Save ${projectName}`, 'Project saved', null, 'success')
            } catch (e: any) {
                console.error('Error in pushing to GitHub repo', e)
                showMessage(`Save ${projectName}`, 'Problem saving to GitHub', `Message: ${e.message}`, 'error')
            }
            removeDialog()
        }
        setDialog(<CommitDialog onClose={removeDialog} onCommit={onPush}/>)
    }

    const saveToGitHub = async () => {
        if (!isSignedIn()) {
            await signIn()
        }
        if (!isSignedIn()) {
            showMessage(`Save ${projectName}`, 'You need to sign in to GitHub to save this project', null, 'error')
            removeDialog()
            return
        }
        const fs = localProjectStore.fileSystem
        const gitProjectStore = new GitProjectStore(fs, http, gitHubUsername(), gitHubAccessToken())
        if (await gitProjectStore.isConnectedToGitHubRepo(projectName)) {
            pushToGitHub(gitProjectStore)
        } else {
            if (!(await isGitWorkingCopy(fs, projectName))) {
                await gitProjectStore.init(projectName)
            }

            const onCreate = async (repoName: string) => {
                try {
                    const createdRepoName = await gitProjectStore.createGitHubRepo(projectName, repoName)
                    showMessage(`Save ${projectName}`, `Created GitHub repository ${createdRepoName}`, null, 'success')
                    pushToGitHub(gitProjectStore)
                } catch (e: any) {
                    console.error('Error in creating GitHub repo', e)
                    showMessage('Problem creating GitHub repository', `Message: ${e.message}`, null, 'error')
                    removeDialog()
                }
            }
            setDialog(<CreateGitHubRepoDialog onClose={removeDialog} onCreate={onCreate} defaultName={projectName}/>)
        }
    }
    const showMessage = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => {
        setMessage(<Alert severity={severity} sx={{width: '90%', mt: 2, marginLeft: 'auto', marginRight: 'auto'}}>
            <AlertTitle>{title}</AlertTitle>
            <p id="message">{message}</p>
            <p>{detail}</p>
        </Alert>)
    }

    const closeWindow = () => window.close()

    if (!actionState) {
        setActionState('inProgress')
        switch(action) {
            case 'get':
                getFromGitHub()
                break
            case 'save':
                saveToGitHub()
                break
            case 'update':
                updateFromGitHub()
                break
        }
    }

    return <ThemeProvider theme={theme}>
            {message}
            {dialog}
            {actionState === 'done' ? <Button variant='contained'  sx={{mt: 2, display: 'block', ml: 'auto', mr: 'auto'}} onClick={closeWindow}>Continue</Button> : null }
        </ThemeProvider>
}