import ProjectHandler from './ProjectHandler'
import React, {ChangeEvent, useEffect, useState} from 'react'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {AppElementAction, AppElementActionName} from './Types'
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
    IconButton,
    TextField,
} from '@mui/material'
import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'
import {theme} from '../shared/styling'
import ProjectFileStore from './ProjectFileStore'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import Close from '@mui/icons-material/Close'
import {LocalProjectStore, LocalProjectStoreIDB} from './LocalProjectStore'
import {editorEmptyProject} from '../util/initialProjects'
import GitProjectStore, {isGitWorkingCopy} from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {gitHubAccessToken, gitHubUsername, signIn} from '../shared/authentication'


declare global {
    var getProject: () => Project
    var setProject: (project: string|Project) => void
}

function CloseButton(props: {onClose:() => void}) {
    return <IconButton
        aria-label="close"
        onClick={props.onClose}
        sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
        }}
    >
        <Close />
    </IconButton>
}
function validateProjectName(name: string, existingNames: string[]) {
    if (existingNames.includes(name)) return 'There is already a project with this name'
    const match = name.match(/[^\w \(\)#%&+=.-]/g)
    if (match) return 'Name contains invalid characters: ' + match.join('')
    return null
}

function OpenDialog({names, onClose, onSelect}: { names: string[], onClose: () => void, onSelect: (name: string) => void }) {
    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Open project <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                {names.length ?
                <List dense={true} sx={{pt: 0, minWidth: '25em'}}>
                    {names.map((name) => (
                        <ListItemButton onClick={() => onSelect(name)} key={name}>
                            <ListItemText primary={name}/>
                        </ListItemButton>
                    ))}
                </List> :
                <DialogContentText>
                    No projects found on this computer.<br/>
                    Please use File - New to create a project.
                </DialogContentText>
                }
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

function NewDialog({onClose, onCreate, existingNames}: { onClose: () => void, onCreate: (name: string) => void, existingNames: string[] }) {
    const [name, setName] = useState<string>('')
    const onChange = (event: ChangeEvent) => setName((event.target as HTMLInputElement).value)

    const error = validateProjectName(name, existingNames)
    const canCreate = name && !error
    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>New project <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a name for the new project.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Project Name"
                    fullWidth
                    variant="standard"
                    onChange={onChange}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={() => onCreate(name)} disabled={!canCreate}>Create</Button>
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

function UploadDialog({onClose, onUploaded}: { onClose: () => void, onUploaded: (name: string, data: string) => void }) {
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {target} = event
        const {files} = target
        const file1 = files?.[0]
        if (file1) {
            onUpload (file1).then( onClose )
        } else {
            onClose()
        }
    }

    const onBlur = (event: ChangeEvent<HTMLInputElement>) => {
        const {target} = event
        const {files} = target
        console.log('blur', files)
    }

    const onUpload = async (file: File | undefined) => {
        if (file) {
            const data = await file.text()
            onUploaded(file.name, data)
        }
    }

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Upload file <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <input
                    style={{ display: 'none' }}
                    id="uploadFileInput"
                    type="file"
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </DialogContent>
            <DialogActions>
                <label htmlFor="uploadFileInput">
                    <Button variant="contained" component="span">Choose File</Button>
                </label>
                <Button variant='outlined' onClick={onClose} sx={{ml: 1}}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

function GetFromGitHubDialog({onClose, onGet, existingNames}: { onClose: () => void, onGet: (url: string, projectName: string) => Promise<void>, existingNames: string[]}) {
    const [url, setUrl] = useState<string>('')
    const [projectName, setProjectName] = useState<string>('')

    const projectNameFromUrl = (url: string) => {
        const urlNoExt = url.replace(/\.g?i?t?$/, '')
        const nameFromUrlRegex = /https:\/\/[^/]+\/[^/]+\/(.+)(\.git)?$/
        return urlNoExt.match(nameFromUrlRegex)?.[1]
    }
    const onChangeUrl = (event: ChangeEvent) => {
        const newUrl = (event.target as HTMLInputElement).value
        const oldNameFromUrl = projectNameFromUrl(url)
        const nameFromNewUrl = projectNameFromUrl(newUrl) ?? ''
        setUrl(newUrl)
        if (nameFromNewUrl && projectName === '' || projectName === oldNameFromUrl) {
            setProjectName(nameFromNewUrl)
        }
    }
    const onChangeProjectName = (event: ChangeEvent) => setProjectName((event.target as HTMLInputElement).value)

    const error = validateProjectName(projectName, existingNames)
    const canCreate = url && projectName && !error
    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Get project from GitHub <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter the GitHub URL and a name for the new project.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="url"
                    label="GitHub URL"
                    fullWidth
                    variant="standard"
                    value={url}
                    onChange={onChangeUrl}
                />
                <TextField
                    margin="dense"
                    id="name"
                    label="Project Name"
                    fullWidth
                    variant="standard"
                    value={projectName}
                    onChange={onChangeProjectName}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={() => onGet(url, projectName)} disabled={!canCreate}>Get</Button>
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )

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

export default function EditorRunner() {
    const [projectHandler] = useState<ProjectHandler>(new ProjectHandler())
    const [projectFileStore] = useState<ProjectFileStore>(new ProjectFileStore(projectHandler))
    const [localProjectStore] = useState<LocalProjectStore>(new LocalProjectStoreIDB())

    const [gitHubUrl, setGitHubUrl] = useState<string | null>('')
    const [project, setProject] = useState<Project>(projectHandler.current)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const removeDialog = () => setDialog(null)
    const updateProjectAndSave = () => {
        setProject(projectHandler.current)
        localProjectStore.writeProjectFile(projectHandler.name, projectHandler.current.withoutFiles())
    }

    const updateProjectHandler = (proj: Project, name: string) => {
        projectHandler.setProject(proj)
        projectHandler.name = name
        setProject(proj)
        const gitProjectStore = new GitProjectStore(localProjectStore.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote(name).then( setGitHubUrl )
    }

    useEffect( () => {
        window.setProject = (project: string|Project) => {
            const proj = typeof project === 'string' ? loadJSONFromString(project) as Project : project
            updateProjectHandler(proj, 'Test project')
        }
        window.getProject = () => projectHandler.current
    })

    const isFileElement = (id: ElementId) => projectHandler.current.findElement(id)?.kind === 'File'

    const onPropertyChange = async (id: ElementId, propertyName: string, value: any) => {
        const element = projectHandler.current.findElement(id)!
        if (element.kind === 'File' && propertyName === 'name') {
            const projectName = projectHandler.name
            await localProjectStore.rename(projectName, element.name, value)
            const gitProjectStore = new GitProjectStore(localProjectStore.fileSystem, http, null, null)
            await gitProjectStore.rename(projectName, element.name, value)
        }
        projectHandler.setProperty(id, propertyName, value)
        updateProjectAndSave()
    }

    const onInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType)=> {
        const newId = projectHandler.insertNewElement(insertPosition, targetElementId, elementType)
        updateProjectAndSave()
        return newId
    }

    const onMove = (insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) => {
        projectHandler.move(insertPosition, targetElementId, movedElementIds)
        updateProjectAndSave()
    }

    const onUpload = async (targetElementId: ElementId): Promise<ElementId | null> => {
        return new Promise(resolve => {
            const onFileUploaded = async (name: string, data: string) => {
                await localProjectStore.writeTextFile(projectHandler.name, name, data)
                const newId = projectHandler.insertNewElement('inside', targetElementId, 'File', {name})
                updateProjectAndSave()
                removeDialog()
                resolve(newId)
            }

            const onClose = () => {
                removeDialog()
                resolve(null)
            }

            setDialog(<UploadDialog onClose={onClose} onUploaded={onFileUploaded}/>)
        })
    }

    const deleteFilesWhereNecessary = (ids: ElementId[]) => {
        const fileIds = ids.filter( isFileElement )
        const projectName = projectHandler.name
        const gitProjectStore = new GitProjectStore(localProjectStore.fileSystem, http, null, null)

        return Promise.all(fileIds.map( async id => {
            const filename = projectHandler.current.findElement(id)?.name
            if (filename) {
                await localProjectStore.deleteFile(projectName, filename)
                await gitProjectStore.deleteFile(projectName, filename)
            }
        }))
    }

    const onAction = async (ids: ElementId[], action: AppElementAction): Promise<ElementId | null | void> => {
        if (action === 'upload') {
            return await onUpload(ids[0])
        }
        if (action === 'delete') {
            await deleteFilesWhereNecessary(ids)
            // do not return - delete from project too
        }

        try {
            await projectHandler.elementAction(ids, action.toString() as AppElementActionName)
            updateProjectAndSave()
        } catch(error: any) {
            alert(error.message)
        }
    }

    const onNew = async () => {
        const existingProjectNames = await localProjectStore.getProjectNames()
        const onProjectCreated = async (name: string) => {
            await localProjectStore.createProject(name)
            updateProjectHandler(editorEmptyProject().withFiles(), name)
            await localProjectStore.writeProjectFile(name, projectHandler.current.withoutFiles())
            removeDialog()
        }

        setDialog(<NewDialog onClose={removeDialog} onCreate={onProjectCreated} existingNames={existingProjectNames}/>)
    }

    const onOpen = async () => {
        const names = await localProjectStore.getProjectNames()
        const onProjectSelected = async (name: string) => {
            const projectWorkingCopy = await localProjectStore.getProject(name)
            const project = projectWorkingCopy.projectWithFiles
            updateProjectHandler(project, name)
            removeDialog()
        }

        setDialog(<OpenDialog names={names} onClose={removeDialog} onSelect={onProjectSelected}/>)
    }

    const onGetFromGitHub = async() => {
        console.log('Get from GitHub')
        const existingProjectNames = await localProjectStore.getProjectNames()
        const onGet = async (url: string, projectName: string) => {
            const fs = localProjectStore.fileSystem
            const store =  new GitProjectStore(fs, http)
            try {
                await store.clone(url, projectName)
            } catch(e: any) {
                console.error('Error in clone', e)
                showAlert('Problem getting from GitHub', `Message: ${e.message}`, null, 'error')
            }
            const projectWorkingCopy = await localProjectStore.getProject(projectName)
            updateProjectHandler(projectWorkingCopy.projectWithFiles, projectName)
            removeDialog()
        }
        setDialog(<GetFromGitHubDialog onClose={removeDialog} onGet={onGet} existingNames={existingProjectNames}/>)
    }

    const onUpdateFromGitHub = async() => {
        console.log('Update from GitHub')
        const fs = localProjectStore.fileSystem
        const store =  new GitProjectStore(fs, http)
        const projectName = projectHandler.name
        try {
            await store.pull(projectName)
            showAlert('Project updated from GitHub', '', null, 'success')
        } catch(e: any) {
            console.error('Error in pull', e)
            showAlert('Problem updating from GitHub', `Message: ${e.message}`, null, 'error')
        }
        const projectWorkingCopy = await localProjectStore.getProject(projectName)
        updateProjectHandler(projectWorkingCopy.projectWithFiles, projectName)
    }

    const onExport = async () => {
        await projectFileStore.saveFileAs()
    }

    const isSignedIn = () => gitHubUsername() && gitHubAccessToken()

    function pushToGitHub(gitProjectStore: GitProjectStore) {
        const onPush = async (commitMessage: string) => {
            try {
                await gitProjectStore.commitAndPush(projectHandler.name, commitMessage)
                showAlert('Saved to GitHub', '', null, 'success')
            } catch (e: any) {
                console.error('Error in pushing to GitHub repo', e)
                showAlert('Problem saving to GitHub', `Message: ${e.message}`, null, 'error')
            }
            removeDialog()
        }
        setDialog(<CommitDialog onClose={removeDialog} onCommit={onPush}/>)
    }

    const onSaveToGitHub = async () => {
        if (!isSignedIn()) {
            await signIn()
        }
        if (!isSignedIn()) {
            window.alert('Please sign in to GitHub to save this project')
            return
        }
        const fs = localProjectStore.fileSystem
        const gitProjectStore = new GitProjectStore(fs, http, gitHubUsername(), gitHubAccessToken())
        const projectName = projectHandler.name
        if (await gitProjectStore.isConnectedToGitHubRepo(projectName)) {
            pushToGitHub(gitProjectStore)
        } else {
            if (!(await isGitWorkingCopy(fs, projectName))) {
                await gitProjectStore.init(projectName)
            }

            const onCreate = async (repoName: string) => {
                try {
                    const createdRepoName = await gitProjectStore.createGitHubRepo(projectName, repoName)
                    setGitHubUrl(await gitProjectStore.getOriginRemote(projectName))
                    showAlert('Created GitHub repository', `Created repository ${createdRepoName}`, null, 'success')
                    pushToGitHub(gitProjectStore)
                } catch (e: any) {
                    console.error('Error in creating GitHub repo', e)
                    showAlert('Problem creating GitHub repository', `Message: ${e.message}`, null, 'error')
                    removeDialog()
                }
            }
            setDialog(<CreateGitHubRepoDialog onClose={removeDialog} onCreate={onCreate} defaultName={projectName}/>)
        }
    }
    const showAlert = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => {
        const removeAlert = () => setAlertMessage(null)
        setAlertMessage(<Alert severity={severity} onClose={removeAlert}>
            <AlertTitle>{title}</AlertTitle>
            <p id="alertMessage">{message}</p>
            <p>{detail}</p>
        </Alert>)
    }

    const onUpdateFromGitHubProp = gitHubUrl ? onUpdateFromGitHub : undefined
    const runUrl = gitHubUrl ? window.location.origin + `/run/gh/${gitHubUrl.replace('https://github.com/', '')}` : undefined
    return <ThemeProvider theme={theme}>
            {alertMessage}
            {dialog}
            <Editor project={project} projectStoreName={projectHandler.name}
                    onChange={onPropertyChange} onInsert={onInsert} onMove={onMove} onAction={onAction}
                    onNew={onNew} onOpen={onOpen}
                    onExport={onExport}
                    onGetFromGitHub={onGetFromGitHub} onSaveToGitHub={onSaveToGitHub} onUpdateFromGitHub={onUpdateFromGitHubProp}
                    runUrl={runUrl}
            />
        </ThemeProvider>
}