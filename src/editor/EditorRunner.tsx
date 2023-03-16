import ProjectHandler from './ProjectHandler'
import React, {ChangeEvent, useEffect, useRef, useState} from 'react'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {AppElementAction, AppElementActionName, FileSystemTree} from './Types'
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
import {loadJSONFromString} from '../model/loadJSON'
import {theme} from '../shared/styling'
import ProjectFileStore from './ProjectFileStore'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import {LocalProjectStore, LocalProjectStoreIDB} from './LocalProjectStore'
import {DiskProjectStore} from './DiskProjectStore'
import {editorEmptyProject} from '../util/initialProjects'
import GitProjectStore, {isGitWorkingCopy} from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {gitHubAccessToken, gitHubUsername, signIn} from '../shared/authentication'
import {GetFromGitHubDialog} from './actions/GetFromGitHub'
import {CloseButton} from './actions/ActionComponents'
import {UIManager, validateProjectName} from './actions/actionHelpers'
import {previewClientFiles, previewCodeFile} from './previewFiles'
import {ASSET_DIR} from '../shared/constants'
import {waitUntil} from '../util/helpers'
import ProjectOpener from './ProjectOpener'
import EditorManager from './actions/EditorManager'
import {debounce} from 'lodash'

declare global {
    var getProject: () => Project | null
    var setProject: (project: string|Project) => void

    var showDirectoryPicker: (options: object) => FileSystemDirectoryHandle
}

const safeJsonParse = (text: string) => {
    try {
        return JSON.parse(text)
    } catch(e: any) {
        return e.message ?? e
    }
}


const userCancelledFilePick = (e:any) => /*e instanceof DOMException &&*/ e.name === 'AbortError'

const debouncedSave = debounce( (updatedProject: Project, projectStore: DiskProjectStore) => {
    projectStore.writeProjectFile(updatedProject.withoutFiles())
}, 1000)
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

function UploadDialog({onClose, onUploaded}: { onClose: () => void, onUploaded: (name: string, data: Uint8Array) => void }) {
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
            const data = await file.arrayBuffer() as Uint8Array
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
    const [localProjectStore, setLocalProjectStore] = useState<DiskProjectStore>()
    const [updateTime, setUpdateTime] = useState<number | null>(null)

    const [gitHubUrl, setGitHubUrl] = useState<string | null>('')
    const [,setProject] = useState<Project | null>(null)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const removeDialog = () => setDialog(null)
    
    const getOpenProject = (): Project => {
        if (!projectHandler.current) {
            throw new Error('No current project open')
        }
        
        return projectHandler.current
    }

    const updateProjectAndSave = () => {
        const updatedProject = getOpenProject()
        setProject(updatedProject)
        debouncedSave(updatedProject, localProjectStore!)

        const [path, fileContents] = previewCodeFile(updatedProject)
        writeFile(path, fileContents)
    }

    const updateProjectHandler = async (proj: Project, name: string) => {
        projectHandler.setProject(proj)
        projectHandler.setName(name)
        setProject(proj)
        const filesToMount = await previewClientFiles(getOpenProject(), localProjectStore!, window.location.origin)
        console.log('re-mounting files', filesToMount)
        mountFiles(filesToMount)
        setUpdateTime(Date.now())

        const gitProjectStore = new GitProjectStore(localProjectStore!.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote().then(setGitHubUrl)
    }

    const updateProjectHandlerFromStore = async (proj: Project, name: string, projectStore: DiskProjectStore) => {
        projectHandler.setProject(proj)
        projectHandler.setName(name)
        setProject(proj)
        const filesToMount = await previewClientFiles(getOpenProject(), projectStore, window.location.origin)
        console.log('re-mounting files', filesToMount)
        mountFiles(filesToMount)
        setUpdateTime(Date.now())

        const gitProjectStore = new GitProjectStore(projectStore.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote().then(setGitHubUrl)
    }

    async function openOrUpdateProject(name: string) {
        const projectWorkingCopy = await localProjectStore!.getProject()
        const project = projectWorkingCopy.projectWithFiles
        await updateProjectHandler(project, name)
    }

    async function openOrUpdateProjectFromStore(name: string, projectStore: DiskProjectStore) {
        const projectWorkingCopy = await projectStore.getProject()
        const project = projectWorkingCopy.projectWithFiles
        await updateProjectHandlerFromStore(project, name, projectStore)
    }

    function mountFiles(filesToMount: FileSystemTree) {
        navigator.serviceWorker.controller!.postMessage({type: 'mount', fileSystem: filesToMount})
    }

    function writeFile(path: string, contents: Uint8Array | string) {
        navigator.serviceWorker.controller!.postMessage({type: 'write', path, contents})
    }

    function selectItemsInPreview(ids: string[]) {
        navigator.serviceWorker.controller!.postMessage({type: 'editorHighlight', ids})
    }

    const initServiceWorker = () => {

        const doInit = async () => {
            console.log('Initializing service worker')
            navigator.serviceWorker.onmessage = (event) => {
                const message = event.data
                if (message.type === 'componentSelected') {
                    const {id} = message
                    const selectedItem = getOpenProject().findElementByPath(id)
                    onSelectedItemsChange(selectedItem ? [selectedItem.id] : [])
                }
            }
        }

        waitUntil( ()=> navigator.serviceWorker.controller, 500, 5000 ).then(doInit).catch(() => {
            console.log('Timed out waiting for service worker - reloading')
            window.location.reload()
        })
    }

    useEffect( () => {
        window.setProject = (project: string|Project) => {
            const proj = typeof project === 'string' ? loadJSONFromString(project) as Project : project
            updateProjectHandler(proj, 'Test project')
        }
        window.getProject = () => projectHandler.current
    })
    useEffect( initServiceWorker, [] )

    const isFileElement = (id: ElementId) => getOpenProject().findElement(id)?.kind === 'File'

    const onPropertyChange = async (id: ElementId, propertyName: string, value: any) => {
        const element = getOpenProject().findElement(id)!
        if (element.kind === 'File' && propertyName === 'name') {
            const projectName = projectHandler.name!
            await localProjectStore!.renameAsset(element.name, value)
            const gitProjectStore = new GitProjectStore(localProjectStore!.fileSystem, http, null, null)
            await gitProjectStore.rename(ASSET_DIR + '/' + element.name, ASSET_DIR + '/' + value)
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
            const onFileUploaded = async (name: string, data: Uint8Array) => {
                await localProjectStore!.writeAssetFile(name, data)
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
        const projectName = projectHandler.name!
        const gitProjectStore = new GitProjectStore(localProjectStore!.fileSystem, http, null, null)

        return Promise.all(fileIds.map( async id => {
            const filename = getOpenProject().findElement(id)?.name
            if (filename) {
                await localProjectStore!.deleteAssetFile(filename)
                await gitProjectStore.deleteFile(ASSET_DIR + '/' + filename)
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
        try {
            const dirHandle = await window.showDirectoryPicker({id: 'elemento_editor', mode: 'readwrite'})
            const projectStore = new DiskProjectStore(dirHandle)
            setLocalProjectStore(projectStore)
            await projectStore.createProject()
            await projectStore.writeProjectFile(editorEmptyProject())
            await openOrUpdateProjectFromStore(projectStore.name, projectStore)
        } catch (e: any) {
            if (!userCancelledFilePick(e)) {
                throw e
            }
        }
    }

    const onOpen = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker({id: 'elemento_editor', mode: 'readwrite'})
            const projectStore = new DiskProjectStore(dirHandle)
            setLocalProjectStore(projectStore)
            await openOrUpdateProjectFromStore(projectStore.name, projectStore)
        } catch (e: any) {
            if (!userCancelledFilePick(e)) {
                throw e
            }
        }
    }

    const onGetFromGitHub = () => setDialog(<GetFromGitHubDialog editorManager={new EditorManager(localProjectStore!, openOrUpdateProject)}
                                                                 uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onUpdateFromGitHub = async() => {
        console.log('Update from GitHub')
        const fs = localProjectStore!.fileSystem
        const store =  new GitProjectStore(fs, http)
        const projectName = projectHandler.name!
        try {
            showAlert('Updating from GitHub', projectName, null, 'info')
            await store.pull()
            showAlert('Project updated from GitHub', '', null, 'success')
        } catch (e: any) {
            console.error('Error in pull', e)
            showAlert('Problem updating from GitHub', `Message: ${e.message}`, null, 'error')
            }
        const projectWorkingCopy = await localProjectStore!.getProject()
        await updateProjectHandler(projectWorkingCopy.projectWithFiles, projectName)
        }

    const onExport = async () => {
        await projectFileStore.saveFileAs()
    }

    const isSignedIn = () => gitHubUsername() && gitHubAccessToken()

    function pushToGitHub(gitProjectStore: GitProjectStore) {
        const onPush = async (commitMessage: string) => {
            try {
                await gitProjectStore.commitAndPush(projectHandler.name!, commitMessage)
                showAlert('Saved to GitHub', '', null, 'success')
            } catch (e: any) {
                console.error('Error in pushing to GitHub repo', e)
                const description = e?.data?.response ?? null
                showAlert('Problem saving to GitHub', e.message, description, 'error')
            }
            removeDialog()
        }
        setDialog(<CommitDialog onClose={removeDialog} onCommit={onPush}/>)
    }

    const onSaveToGitHub = async () => {
        const projectName = projectHandler.name!
        if (!isSignedIn()) {
            await signIn()
        }
        if (!isSignedIn()) {
            showAlert(`Save ${projectName}`, 'You need to sign in to GitHub to save this project', null, 'error')
            removeDialog()
            return
        }
        const fs = localProjectStore!.fileSystem
        const gitProjectStore = new GitProjectStore(fs, http, gitHubUsername(), gitHubAccessToken())
        if (await gitProjectStore.isConnectedToGitHubRepo()) {
            pushToGitHub(gitProjectStore)
        } else {
            if (!(await isGitWorkingCopy(fs))) {
                await gitProjectStore.init()
            }

            const onCreate = async (repoName: string) => {
                try {
                    const createdRepoName = await gitProjectStore.createGitHubRepo(projectName)
                    setGitHubUrl(await gitProjectStore.getOriginRemote())
                    showAlert(`Save ${projectName}`, `Created repository ${createdRepoName}`, null, 'success')
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

    const onSelectedItemsChange = (ids: string[]) => {
        setSelectedItemIds(ids)
        const pathIds = ids.map( id => getOpenProject().findElementPath(id)).filter(id => id !== null) as string[]
        selectItemsInPreview(pathIds)
    }

    const onUpdateFromGitHubProp = gitHubUrl ? onUpdateFromGitHub : undefined
    const runUrl = gitHubUrl ? window.location.origin + `/run/gh/${gitHubUrl.replace('https://github.com/', '')}` : undefined
    const previewUrl = updateTime ? `/preview/?v=${updateTime}` : '/preview/'
    return <ThemeProvider theme={theme}>
        {alertMessage}
        {dialog}
        { projectHandler.current ?
            <Editor project={getOpenProject()} projectStoreName={projectHandler.name!}
                    onChange={onPropertyChange} onInsert={onInsert} onMove={onMove} onAction={onAction}
                    onNew={onNew} onOpen={onOpen}
                    onExport={onExport}
                    onGetFromGitHub={onGetFromGitHub} onSaveToGitHub={onSaveToGitHub} onUpdateFromGitHub={onUpdateFromGitHubProp}
                    runUrl={runUrl} previewUrl={previewUrl}
                    selectedItemIds={selectedItemIds} onSelectedItemsChange={onSelectedItemsChange}
            /> :
            <ProjectOpener onNew={onNew} onOpen={onOpen} onGetFromGitHub={onGetFromGitHub} />
        }
        </ThemeProvider>
}
