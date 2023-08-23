import ProjectHandler from './ProjectHandler'
import React, {useEffect, useRef, useState} from 'react'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {ActionsAvailableFn, AppElementAction, AppElementActionName} from './Types'
import {Alert, AlertColor, AlertTitle, Box, Grid,} from '@mui/material'
import {default as ModelElement} from '../model/Element'
import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'
import {theme} from '../shared/styling'
import {DiskProjectStore} from './DiskProjectStore'
import GitProjectStore from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {gitHubAccessToken, gitHubUsername, signIn, useSignedInState} from '../shared/authentication'
import {GetFromGitHubDialog} from './actions/GetFromGitHub'
import {chooseDirectory, UIManager, validateDirectoryForOpen} from './actions/actionHelpers'
import {ASSET_DIR} from '../shared/constants'
import {noop, waitUntil} from '../util/helpers'
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
import PreviewPanel from './PreviewPanel'
import AppBar from '../shared/AppBar'
import FirebasePublish from '../model/FirebasePublish'
import EditorHelpPanel from './EditorHelpPanel'
import {elementTypes} from '../model/elements'
import EditorMenuBar from './EditorMenuBar'
import {without} from 'ramda'
import {ToolWindow} from './ToolWindow'
import {UploadDialog} from './UploadDialog'
import {CreateGitHubRepoDialog} from './CreateGitHubRepoDialog'
import {CommitDialog} from './CommitDialog'

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
    const [helpVisible, setHelpVisible] = useState(false)
    const [firebaseConfigName, setFirebaseConfigName] = useState<string|null>(null)

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
    const itemNameFn = (id: ElementId) => getOpenProject().findElement(id)?.name ?? id
    const actionsAvailableFn: ActionsAvailableFn = (ids: ElementId[]): AppElementAction[] => getOpenProject().actionsAvailable(ids)
    const actionsAvailableFnNoInsert: ActionsAvailableFn = (ids: ElementId[]): AppElementAction[] => without(['insert'], actionsAvailableFn(ids))

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
            return onShow(ids[0])
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

    const onUndo = ()=> {
        projectHandler.undo()
        updateProjectAndSave()
    }
    const onRedo = ()=> {
        projectHandler.redo()
        updateProjectAndSave()
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

    const onHelp = () => setHelpVisible(!helpVisible)


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

    const keyHandler = (event: React.KeyboardEvent) => {
        if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
            if (event.shiftKey) {
                onRedo()
            } else {
                onUndo()
            }
            event.preventDefault()
        }
    }

    const allElementTypes = Object.keys(elementTypes()) as ElementType[]

    const onMenuInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => {
        const newElementId = onInsert(insertPosition, targetElementId, elementType)
        onSelectedItemsChange([newElementId])
    }

    const signedIn = useSignedInState()

    function mainContent() {
        const previewFrameRef = useRef<HTMLIFrameElement>(null)

        if (projectHandler.current) {
            const project = getOpenProject()
            const onUpdateFromGitHubProp = gitHubUrl ? onUpdateFromGitHub : undefined
            const appName = () => project.findChildElements(App)[0]?.codeName
            const runUrl = gitHubUrl ? window.location.origin + `/run/gh/${gitHubUrl.replace('https://github.com/', '')}/${appName()}` : undefined
            const previewUrl = updateTime ? `/studio/preview/${appName()}/?v=${updateTime}` : `/studio/preview/${appName()}/`
            const errors = projectBuilderRef.current?.errors ?? {}
            const projectStoreName = projectHandler.name!
            const firebasePublishForPreview = project.findChildElements(FirebasePublish)[0]
            const projectFirebaseConfigName = firebasePublishForPreview?.name
            const insertMenuItems = (insertPosition: InsertPosition, targetItemId: ElementId): ElementType[] => {
                return allElementTypes.filter(type => project.canInsert(insertPosition, targetItemId, type))
            }

            if (projectFirebaseConfigName && projectFirebaseConfigName !== firebaseConfigName) {
                setFirebaseConfigName(projectFirebaseConfigName)
            }

            const appBarTitle = `Elemento Studio - ${projectStoreName}`
            const OverallAppBar = <Box flex='0'>
                <AppBar title={appBarTitle}/>
            </Box>
            const EditorHeader = <Box flex='0'>
                <EditorMenuBar {...{onNew, onOpen, onGetFromGitHub, onUpdateFromGitHub, onSaveToGitHub, signedIn,
                    onInsert: onMenuInsert,
                    insertMenuItems,
                    onAction,
                    actionsAvailableFn: actionsAvailableFnNoInsert,
                    itemNameFn,
                    selectedItemIds, onHelp}}/>
            </Box>

            return <Box display='flex' flexDirection='column' height='100%' width='100%'>
                <Box flex='1' maxHeight={tool ? '60%' : '100%'}>
                    <Box display='flex' flexDirection='column' height='100%' width='100%' onKeyDown={keyHandler}
                         tabIndex={-1}>
                        {OverallAppBar}
                        <Box flex='1' minHeight={0}>
                            <Grid container columns={20} spacing={0} height='100%'>
                                <Grid item xs={10} height='100%'>
                                    <Box display='flex' flexDirection='column' height='100%' width='100%'
                                         id='editorMain' position='relative'>
                                        {EditorHeader}
                                        <Box height='calc(100% - 49px)'>
                                            <Editor project={project}
                                                    onChange={onPropertyChange} onInsert={onInsert} onMove={onMove}
                                                    onAction={onAction}
                                                    actionsAvailableFn={actionsAvailableFn}
                                                    selectedItemIds={selectedItemIds}
                                                    onSelectedItemsChange={onSelectedItemsChange}
                                                    errors={errors}
                                            />
                                        </Box>
                                        {helpVisible ?
                                            <Box flex='1' maxHeight='50%'>
                                                <EditorHelpPanel onClose={noop}/>
                                            </Box> : null
                                        }
                                    </Box>
                                </Grid>
                                <Grid item xs={10} height='100%' overflow='scroll'>
                                    <PreviewPanel
                                        preview={
                                            <iframe name='appFrame' src={previewUrl} ref={previewFrameRef}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none',
                                                        backgroundColor: 'white'
                                                    }}/>
                                        }
                                        configName={firebaseConfigName} runUrl={runUrl}/>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Box>
                {tool ?
                    <Box flex='1' maxHeight='40%'>
                        <ToolWindow tool={tool} previewFrame={previewFrameRef.current} onClose={onCloseToolWindow}/>
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

