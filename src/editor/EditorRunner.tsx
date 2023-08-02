import ProjectHandler from './ProjectHandler'
import React, {ChangeEvent, useEffect, useRef, useState} from 'react'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {AppElementAction, AppElementActionName, VoidFn} from './Types'
import {
    Alert,
    AlertColor,
    AlertTitle,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import {default as ModelElement} from '../model/Element'
import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'
import {theme} from '../shared/styling'
import {DiskProjectStore} from './DiskProjectStore'
import GitProjectStore from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {gitHubAccessToken, gitHubUsername, signIn} from '../shared/authentication'
import {GetFromGitHubDialog} from './actions/GetFromGitHub'
import {CloseButton} from './actions/ActionComponents'
import {chooseDirectory, UIManager, validateDirectoryForOpen} from './actions/actionHelpers'
import {ASSET_DIR} from '../shared/constants'
import {waitUntil} from '../util/helpers'
import ProjectOpener from './ProjectOpener'
import EditorManager from './actions/EditorManager'
import lodash from 'lodash';
import {NewProjectDialog} from './actions/NewProject'
import ProjectBuilder from "../generator/ProjectBuilder";
import BrowserProjectLoader from "../generator/BrowserProjectLoader";
import DiskProjectStoreFileLoader from "./DiskProjectStoreFileLoader";
import BrowserRuntimeLoader from "./BrowserRuntimeLoader";
import PostMessageFileWriter from "./PostMessageFileWriter";
import HttpFileWriter from "./HttpFileWriter";
import MultiFileWriter from '../generator/MultiFileWriter'
import DiskProjectStoreFileWriter from './DiskProjectStoreFileWriter'
import App from '../model/App'
import Tool from '../model/Tool'
import IconButton from '@mui/material/IconButton'
import {CancelOutlined} from '@mui/icons-material'
import {EditorController} from './EditorController'

const {debounce} = lodash;

declare global {
    var getProject: () => Project | null
    var setProject: (project: string|Project) => void

    var showDirectoryPicker: (options: object) => Promise<FileSystemDirectoryHandle>
}

const devServerUrl = 'http://localhost:4444'

const safeJsonParse = (text: string) => {
    try {
        return JSON.parse(text)
    } catch(e: any) {
        return e.message ?? e
    }
}


const debouncedSave = debounce( (updatedProject: Project, projectStore: DiskProjectStore) => {
    projectStore.writeProjectFile(updatedProject.withoutFiles())
}, 1000)

async function updateServerFile(serverAppName: string, path: string, contents: Uint8Array | string, afterUpdate: () => any) {
    try {
        await fetch(`${devServerUrl}/file/${path}`, {method: "PUT", body: contents,})
        console.log('Updated server file', serverAppName, path)
        afterUpdate()
    } catch (error) {
        console.error('Error updating server file', error);
    }
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

function ToolWindow({tool, onClose}: { tool: Tool, onClose: VoidFn }) {
    const name = tool.name
    const toolUrl = `${location.origin}/studio/preview/tools/${tool.codeName}/`
    const toolFrameRef = useRef<HTMLIFrameElement>(null)
    useEffect( () => {
        const contentWindow = toolFrameRef.current?.contentWindow
        if (contentWindow) {
            // @ts-ignore
            (contentWindow as Window).Editor = new EditorController()
        } else {
            console.error('Tool content window not present')
        }
    }, [])
    return <Stack height='100%'>
        <Stack direction='row' spacing={1}
               sx={{paddingLeft: '1.5em', height: '2em', color: 'white', backgroundColor: 'secondary.main'}}>
            <Typography sx={{marginTop: '0.3em'}}>{name}</Typography>
            <IconButton edge="start" color="inherit" aria-label="close" sx={{ml: 2}}
                        onClick={onClose}><CancelOutlined/></IconButton>
        </Stack>
        <iframe name='toolFrame' src={toolUrl} ref={toolFrameRef}
                 style={{width: '100%', height: '100%', border: 'none', backgroundColor: 'white'}}/>
    </Stack>
}

const previewCodeBundle = (codeFiles: {[p: string] : string}) =>
    Object.entries(codeFiles).map(([name, code]) => `// File: ${name}\n\n${code}`).join(`\n\n\n`)


export default function EditorRunner() {
    const [projectHandler] = useState<ProjectHandler>(new ProjectHandler())
    const [projectStore, setProjectStore] = useState<DiskProjectStore>()
    const [updateTime, setUpdateTime] = useState<number | null>(null)

    const [gitHubUrl, setGitHubUrl] = useState<string | null>('')
    const [,setProject] = useState<Project | null>(null)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const [tool, setTool] = useState<Tool | null>(null)
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const projectBuilderRef = useRef<ProjectBuilder>()

    const elementoUrl = () => window.location.origin

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
        debouncedSave(updatedProject, projectStore!)
        projectBuilderRef.current?.updateProject()
    }

    const updateProjectHandlerFromStore = async (proj: Project, name: string, projectStore: DiskProjectStore) => {
        projectHandler.setProject(proj)
        projectHandler.setName(name)
        setProject(proj)
        await projectBuilderRef.current?.build()

        setUpdateTime(Date.now())

        const gitProjectStore = new GitProjectStore(projectStore.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote().then(setGitHubUrl)
    }

    const newProjectBuilder = (projectStore: DiskProjectStore) => {
        const clientFileWriter = new MultiFileWriter(
            new PostMessageFileWriter(navigator.serviceWorker.controller!),
            new DiskProjectStoreFileWriter(projectStore, 'dist/client')
        )
        const toolFileWriter = new MultiFileWriter(
            new PostMessageFileWriter(navigator.serviceWorker.controller!, 'tools'),
            new DiskProjectStoreFileWriter(projectStore, 'dist/tools')
        )
        const serverFileWriter = new MultiFileWriter(
            new HttpFileWriter(devServerUrl),
            new DiskProjectStoreFileWriter(projectStore, 'dist/server')
        )
        return new ProjectBuilder({
            projectLoader: new BrowserProjectLoader(() => getOpenProject()),
            fileLoader: new DiskProjectStoreFileLoader(projectStore),
            runtimeLoader: new BrowserRuntimeLoader(elementoUrl()),
            clientFileWriter,
            toolFileWriter,
            serverFileWriter
        })
    }

    async function openOrUpdateProjectFromStore(name: string, projectStore: DiskProjectStore) {
        setProjectStore(projectStore)
        const projectWorkingCopy = await projectStore.getProject()
        const project = projectWorkingCopy.projectWithFiles
        projectBuilderRef.current = newProjectBuilder(projectStore)
        await updateProjectHandlerFromStore(project, name, projectStore)
    }

    function renameFile(oldPath: string, newPath: string) {
        navigator.serviceWorker.controller!.postMessage({type: 'rename', oldPath, newPath})
    }

    function writeFile(path: string, contents: Uint8Array | string) {
        navigator.serviceWorker.controller!.postMessage({type: 'write', path, contents})
    }

    function selectItemsInPreview(ids: string[]) {
        navigator.serviceWorker.controller!.postMessage({type: 'editorHighlight', ids})
    }

    function callFunctionInPreview(componentId: string, functionName: string, args: any[] = []) {
        navigator.serviceWorker.controller!.postMessage({type: 'callFunction', componentId, functionName, args})
    }

    const initServiceWorker = () => {

        if (!navigator.serviceWorker) {
            console.error('navigator.serviceWorker not available')
            return
        }

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

        waitUntil( ()=> navigator.serviceWorker.controller, 500, 5000 ).then(doInit)
        .catch(() => {
            console.error('Timed out waiting for service worker')
            // console.log('Reloading')
            // window.location.reload()
        })
    }

    useEffect( () => {
        window.setProject = (project: string|Project) => {
            const proj = typeof project === 'string' ? loadJSONFromString(project) as Project : project
            updateProjectHandlerFromStore(proj, 'Test project', projectStore!)
        }
        window.getProject = () => projectHandler.current
    })
    useEffect( initServiceWorker, [] )

    const isFileElement = (id: ElementId) => getOpenProject().findElement(id)?.kind === 'File'

    async function renameAsset(element: ModelElement, value: any) {
        const oldName = element.name
        const newName = value
        await projectStore!.renameAsset(oldName, newName)
        renameFile(ASSET_DIR + '/' + oldName, ASSET_DIR + '/' + newName)
        const gitProjectStore = new GitProjectStore(projectStore!.fileSystem, http, null, null)
        await gitProjectStore.rename(ASSET_DIR + '/' + oldName, ASSET_DIR + '/' + newName)
    }

    const onPropertyChange = async (id: ElementId, propertyName: string, value: any) => {
        const element = getOpenProject().findElement(id)!
        if (element.kind === 'File' && propertyName === 'name') {
            await renameAsset(element, value)
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
                await projectStore!.writeAssetFile(name, data)
                writeFile(ASSET_DIR + '/' + name, data)
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
        const gitProjectStore = new GitProjectStore(projectStore!.fileSystem, http, null, null)

        return Promise.all(fileIds.map( async id => {
            const filename = getOpenProject().findElement(id)?.name
            if (filename) {
                await projectStore!.deleteAssetFile(filename)
                await gitProjectStore.deleteFile(ASSET_DIR + '/' + filename)
            }
        }))
    }

    const onAction = async (ids: ElementId[], action: AppElementAction): Promise<ElementId | null | void> => {
        if (action === 'show') {
            return await onShow(ids[0])
        }
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

    const onNew = () => setDialog(<NewProjectDialog editorManager={new EditorManager(openOrUpdateProjectFromStore)}
                                                       uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onOpen = async () => {
        const dirHandle = await chooseDirectory()
        if (dirHandle) {
            const error = await validateDirectoryForOpen(dirHandle)
            if (error) {
                showAlert('Open project', error, null, 'error')
            } else {
                const projectStore = new DiskProjectStore(dirHandle)
                await openOrUpdateProjectFromStore(projectStore.name, projectStore)
            }
        }
    }

    const isSignedIn = () => gitHubUsername() && gitHubAccessToken()

    const onGetFromGitHub = () => setDialog(<GetFromGitHubDialog editorManager={new EditorManager(openOrUpdateProjectFromStore)}
                                                                 uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onUpdateFromGitHub = async() => {
        console.log('Update from GitHub')
        const fs = projectStore!.fileSystem
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
        const projectWorkingCopy = await projectStore!.getProject()
        await updateProjectHandlerFromStore(projectWorkingCopy.projectWithFiles, projectName, projectStore!)
    }

    function pushToGitHub(gitProjectStore: GitProjectStore) {
        const onPush = async (commitMessage: string) => {
            try {
                await gitProjectStore.commitAndPush(commitMessage)
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
        const fs = projectStore!.fileSystem
        const gitProjectStore = new GitProjectStore(fs, http, gitHubUsername(), gitHubAccessToken())
        if (await gitProjectStore.isConnectedToGitHubRepo()) {
            pushToGitHub(gitProjectStore)
        } else {
            if (!(await gitProjectStore.isGitWorkingCopy())) {
                await gitProjectStore.init()
            }

            const onCreate = async (repoName: string) => {
                try {
                    const createdRepoName = await gitProjectStore.createGitHubRepo(repoName)
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

    const onShow = (id: ElementId) => {
        const tool = projectHandler.current?.findElement(id) as Tool
        setTool(tool)
    }

    const onCloseToolWindow = ()=> setTool(null)

    function mainContent() {
        if (projectHandler.current) {
            const onUpdateFromGitHubProp = gitHubUrl ? onUpdateFromGitHub : undefined
            const appName = () => getOpenProject().findChildElements(App)[0]?.codeName
            const runUrl = gitHubUrl ? window.location.origin + `/run/gh/${gitHubUrl.replace('https://github.com/', '')}/${appName()}` : undefined
            const previewUrl = updateTime ? `/studio/preview/${appName()}/?v=${updateTime}` : `/studio/preview/${appName()}/`
            const errors = projectBuilderRef.current?.errors ?? {}
            const previewCode = previewCodeBundle(projectBuilderRef.current?.code ?? {})

            return <Box display='flex' flexDirection='column' height='100%' width='100%'>
                <Box flex='1' maxHeight={tool ? '60%' : '100%'}>
                    <Editor project={getOpenProject()} projectStoreName={projectHandler.name!}
                            onChange={onPropertyChange} onInsert={onInsert} onMove={onMove} onAction={onAction}
                            onNew={onNew} onOpen={onOpen}
                            onGetFromGitHub={onGetFromGitHub} onSaveToGitHub={onSaveToGitHub} onUpdateFromGitHub={onUpdateFromGitHubProp}
                            runUrl={runUrl} previewUrl={previewUrl}
                            selectedItemIds={selectedItemIds} onSelectedItemsChange={onSelectedItemsChange}
                            errors = {errors} previewCode={previewCode}
                    />
                </Box>
                {tool ?
                    <Box flex='1' maxHeight='40%'>
                        <ToolWindow tool={tool} onClose={onCloseToolWindow}/>
                    </Box> : null
                }
            </Box>
        } else {
            return <ProjectOpener onNew={onNew} onOpen={onOpen} onGetFromGitHub={onGetFromGitHub} />
        }
    }

    return <ThemeProvider theme={theme}>
        {alertMessage}
        {dialog}
        {mainContent()}
        </ThemeProvider>
}
