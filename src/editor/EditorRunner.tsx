import ProjectHandler from './ProjectHandler'
import React, {useEffect, useRef, useState} from 'react'
//@ts-ignore
import {expose} from '../editorToolApis/postmsgRpc'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {ActionsAvailableFn, AppElementAction, AppElementActionName} from './Types'
import {AlertColor, Box, Button, Grid, Stack, Typography,} from '@mui/material'
import Element, {default as ModelElement} from '../model/Element'
import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'
import {theme} from '../shared/styling'
import {DiskProjectStore} from './DiskProjectStore'
import GitProjectStore from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {gitHubAccessToken, gitHubUsername, isSignedIn, signIn, useSignedInState} from '../shared/authentication'
import {GetFromGitHubDialog} from './actions/GetFromGitHub'
import {AlertMessage, openFromGitHub, UIManager} from './actions/actionHelpers'
import {ASSET_DIR} from '../shared/constants'
import {waitUntil} from '../util/helpers'
import ProjectOpener from './ProjectOpener'
import EditorManager from './actions/EditorManager'
import lodash from 'lodash';
import {NewProjectDialog} from './actions/NewProject'
import ProjectBuilder from '../generator/ProjectBuilder'
import BrowserProjectLoader from '../generator/BrowserProjectLoader'
import DiskProjectStoreFileLoader from './DiskProjectStoreFileLoader'
import BrowserRuntimeLoader from './BrowserRuntimeLoader'
import PostMessageFileWriter from './PostMessageFileWriter'
import MultiFileWriter from '../generator/MultiFileWriter'
import DiskProjectStoreFileWriter from './DiskProjectStoreFileWriter'
import App from '../model/App'
import Tool from '../model/Tool'
import PreviewPanel from './PreviewPanel'
import AppBar from '../shared/AppBar'
import FirebasePublish from '../model/FirebasePublish'
import {elementTypes} from '../model/elements'
import EditorMenuBar from './EditorMenuBar'
import {without} from 'ramda'
import {UploadDialog} from './UploadDialog'
import {CreateGitHubRepoDialog} from './CreateGitHubRepoDialog'
import {CommitDialog} from './CommitDialog'
import ToolImport from '../model/ToolImport'
import ToolTabsPanel from './ToolTabsPanel'
import EditorController from '../editorToolApis/EditorController'
import {editorElement} from './EditorElement'
import PreviewController from '../editorToolApis/PreviewController'
import {OpenFromGitHubDialog} from './actions/OpenFromGitHub'
import {SaveAsDialog} from './actions/SaveAs'
import {OpenDialog} from './actions/Open'
import SettingsHandler from './SettingsHandler'
import {exposeFunctions} from '../editorToolApis/postmsgRpc/server'
import {Status} from './ThrottledCombinedFileWriter'
import ServerMultiFileWriter from './ServerMultiFileWriter'

const {debounce} = lodash;

declare global {
    var getProject: () => Project | null
    var setProject: (project: string | Project) => void

    var showDirectoryPicker: (options: object) => Promise<FileSystemDirectoryHandle>
}

const devServerUrl = 'http://localhost:4444'

const safeJsonParse = (text: string) => {
    try {
        return JSON.parse(text)
    } catch (e: any) {
        return e.message ?? e
    }
}

const debouncedSave = debounce((updatedProject: Project, projectStore: DiskProjectStore) => {
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

const exposeEditorController = (gitHubUrl: string | null, projectHandler: ProjectHandler) => {
    const container = editorElement()
    if (container) {
        const controller = new EditorController(container, gitHubUrl, projectHandler)
        exposeFunctions('Editor', controller)
        console.log('Editor controller initialised')
    }
}

const exposePreviewController = (previewFrame: HTMLIFrameElement | null, getMessageData: (event: any) => object) => {
    const previewWindow = previewFrame?.contentWindow

    if (previewWindow) {
        const controller = new PreviewController(previewWindow)
        exposeFunctions('Preview', controller)
        console.log('Preview controller initialised')
    }
}

const helpToolImport = new ToolImport('helpTool', 'Help', {source: '/help/?header=0'})
const firebaseToolImport = new ToolImport('firebaseTool', 'Firebase', {source: '/firebaseDeploy'})

export default function EditorRunner() {
    const [projectHandler] = useState<ProjectHandler>(new ProjectHandler())
    const [projectStore, setProjectStore] = useState<DiskProjectStore>()
    const [updateTime, setUpdateTime] = useState<number | null>(null)
    const [serverUpdateStatus, setServerUpdateStatus] = useState<Status>('complete')

    const [gitHubUrl, setGitHubUrl] = useState<string | null>('')
    const [openFromGitHubUrl, setOpenFromGitHubUrl] = useState<string | null>('')
    const [, setProject] = useState<Project | null>(null)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const [tools, setTools] = useState<(Tool | ToolImport)[]>([])
    const [selectedTool, setSelectedTool] = useState<string | null>(null)
    const [showTools, setShowTools] = useState<boolean>(false)
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const [firebaseConfigName, setFirebaseConfigName] = useState<string | null>(null)

    const projectBuilderRef = useRef<ProjectBuilder>()
    const previewFrameRef = useRef<HTMLIFrameElement>(null)

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

    const getProjectId = ()=> (projectHandler.getSettings('firebase') as any).projectId
    const getPreviewPassword = ()=> (projectHandler.getSettings('firebase') as any).previewPassword

    const updateProjectHandlerFromStore = async (proj: Project, name: string, projectStore: DiskProjectStore) => {
        const updatePreviewUrlFromSettings = () => setPreviewServerUrl(`https://europe-west2-${getProjectId()}.cloudfunctions.net/ext-elemento-app-server-previewServer`)
        const settingsHandler = await SettingsHandler.new(projectStore, updatePreviewUrlFromSettings)
        projectHandler.setProject(proj, name, settingsHandler)
        updatePreviewUrlFromSettings()
        setProject(proj)
        await projectBuilderRef.current?.build()

        setUpdateTime(Date.now())

        const gitProjectStore = new GitProjectStore(projectStore.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote().then(setGitHubUrl)
    }

    const onServerUpdateStatusChange = (newStatus: Status) => {
        if (newStatus === 'complete') {
            refreshServerAppConnectors()
        }

        setServerUpdateStatus(newStatus)
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

        const previewUploadUrl = () => `https://europe-west2-${getProjectId()}.cloudfunctions.net/ext-elemento-app-server-previewServer/preview`
        const serverFileWriter = new ServerMultiFileWriter({
            previewUploadUrl,
            previewPassword: getPreviewPassword,
            onServerUpdateStatusChange,
            writers: [new DiskProjectStoreFileWriter(projectStore, 'dist/server')]
        })

        return new ProjectBuilder({
            projectLoader: new BrowserProjectLoader(() => getOpenProject()),
            fileLoader: new DiskProjectStoreFileLoader(projectStore),
            runtimeLoader: new BrowserRuntimeLoader(elementoUrl()),
            clientFileWriter,
            toolFileWriter,
            serverFileWriter,
        })
    }

    async function openOrUpdateProjectFromStore(name: string, projectStore: DiskProjectStore) {
        setProjectStore(projectStore)
        const projectWorkingCopy = await projectStore.getProject()
        const project = projectWorkingCopy.projectWithFiles
        projectBuilderRef.current = newProjectBuilder(projectStore)
        await updateProjectHandlerFromStore(project, name, projectStore)
        const initialOpenTools = project.findElementsBy((el: Element) => el.kind === 'Tool' && ((el as Tool).showWhenProjectOpened?? false)) as Tool[]
        setTools(initialOpenTools)
        setSelectedTool(initialOpenTools[0]?.codeName ?? null)
        setShowTools(initialOpenTools.length > 0)
    }

    function refreshServerAppConnectors() {
        const serverAppConnectorIds = getOpenProject().findElementsBy(el => el.kind === 'ServerAppConnector').map( el => el.id)
        const paths = serverAppConnectorIds.map( id => getOpenProject().findElementPath(id))
        paths.map( id => callFunctionInPreview(id!, 'Refresh'))
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

    function setPreviewServerUrl(url: string) {
        navigator.serviceWorker.controller!.postMessage({type: 'previewServer', url})
    }

    function getMessageDataAndAuthorize(event: any) {
        const toolIframes = Array.from(document.querySelectorAll('iframe[data-toolid]')) as HTMLIFrameElement[]
        const sourceIframe = toolIframes.find( f => f.contentWindow === event.source )
        if (!sourceIframe) return null
        const toolId = sourceIframe.getAttribute('data-toolid')
        if (!toolId) return null
        const tool = getOpenProject().findElement(toolId) as (Tool | ToolImport)

        const authorised = tool instanceof Tool
        || new URL(tool.source ?? '').origin === window.location.origin
        || tool.studioAccess
        if (authorised) {
            return event.data
        }

        console.warn('Unauthorised access from tool', tool.name)
        return null
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

        waitUntil(() => navigator.serviceWorker.controller, 500, 5000).then(doInit)
            .catch(() => {
                console.error('Timed out waiting for service worker')
                // console.log('Reloading')
                // window.location.reload()
            })
    }

    const openInitialProjectIfSupplied = () => {
        const searchParams = new URLSearchParams(location.search)
        const initialProjectUrl = searchParams.get('openFromGitHub')
        if (!openFromGitHubUrl && initialProjectUrl) {
            const editorManager = new EditorManager(openOrUpdateProjectFromStore)
            setOpenFromGitHubUrl(initialProjectUrl)
            openFromGitHub(initialProjectUrl, editorManager)
        }
    }
    openInitialProjectIfSupplied()

    useEffect(() => {
        window.setProject = (project: string | Project) => {
            const proj = typeof project === 'string' ? loadJSONFromString(project) as Project : project
            updateProjectHandlerFromStore(proj, 'Test project', projectStore!)
        }
        window.getProject = () => projectHandler.current
    })
    useEffect(initServiceWorker, [])
    useEffect(() => exposeEditorController(gitHubUrl, projectHandler), [editorElement()])
    useEffect(() => exposePreviewController(previewFrameRef.current, getMessageDataAndAuthorize), [previewFrameRef.current])

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

    const onInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => {
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
        const fileIds = ids.filter(isFileElement)
        const gitProjectStore = new GitProjectStore(projectStore!.fileSystem, http, null, null)

        return Promise.all(fileIds.map(async id => {
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
        } catch (error: any) {
            alert(error.message)
        }
    }

    const onUndo = () => {
        projectHandler.undo()
        updateProjectAndSave()
    }
    const onRedo = () => {
        projectHandler.redo()
        updateProjectAndSave()
    }

    const onNew = () => setDialog(<NewProjectDialog editorManager={new EditorManager(openOrUpdateProjectFromStore)}
                                                    uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onSaveAs = () => setDialog(<SaveAsDialog editorManager={new EditorManager(openOrUpdateProjectFromStore)}
                                                    uiManager={new UIManager({onClose: removeDialog, showAlert})}
                                                    currentProjectStore={projectStore!}/>)

    const onOpen = async () => {
        setDialog(<OpenDialog editorManager={new EditorManager(openOrUpdateProjectFromStore)}
                              uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)
    }

    const onHelp = () => showTool(helpToolImport)
    const onFirebase = () => showTool(firebaseToolImport)

    const onGetFromGitHub = () => setDialog(<GetFromGitHubDialog
        editorManager={new EditorManager(openOrUpdateProjectFromStore)}
        uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onOpenFromGitHub = () => setDialog(<OpenFromGitHubDialog
        editorManager={new EditorManager(openOrUpdateProjectFromStore)}
        uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onUpdateFromGitHub = async () => {
        console.log('Update from GitHub')
        const fs = projectStore!.fileSystem
        const store = new GitProjectStore(fs, http)
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
        setAlertMessage(AlertMessage({severity, removeAlert, title, message, detail}))
    }

    const onSelectedItemsChange = (ids: string[]) => {
        setSelectedItemIds(ids)
        const pathIds = ids.map(id => getOpenProject().findElementPath(id)).filter(id => id !== null) as string[]
        selectItemsInPreview(pathIds)
    }

    const onShow = (id: ElementId) => {
        const tool = projectHandler.current?.findElement(id) as (Tool | ToolImport)
        showTool(tool)
    }

    const showTool = (tool: Tool | ToolImport) => {
        let alreadyOpen = tools.some(t => t.id === tool.id)
        if (!alreadyOpen) {
            setTools(tools.concat(tool))
        }
        setSelectedTool(tool.codeName)
        setShowTools(true)
    }

    const onCloseTool = (toolName: string) => {
        const oldToolIndex = tools.findIndex(t => t.codeName === toolName)
        const newTools = tools.filter(t => t.codeName !== toolName)
        setTools(newTools)
        if (selectedTool === toolName) {
            const nextToolIndex = Math.min(oldToolIndex, newTools.length - 1)
            if (nextToolIndex >= 0) {
                setSelectedTool(newTools[nextToolIndex].codeName)
            }
        }
    }

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

            const projectTools = Object.fromEntries(
                project.findElementsBy( el => el.kind === 'Tool' || el.kind === 'ToolImport')
                .map( el => [el.name, ()=> showTool(el as Tool | ToolImport)]))
            const toolItems = {
                'Firebase': onFirebase,
                ...projectTools
            }

            if (projectFirebaseConfigName && projectFirebaseConfigName !== firebaseConfigName) {
                setFirebaseConfigName(projectFirebaseConfigName)
            }

            const appBarTitle = `Elemento Studio - ${projectStoreName}`
            const OverallAppBar = <Box flex='0'>
                <AppBar title={appBarTitle}/>
            </Box>
            const isErrorStatus = serverUpdateStatus instanceof Error
            const statusColor = isErrorStatus ? 'error' : 'inherit'
            const retryButton = isErrorStatus ? <Button onClick={() => projectBuilderRef.current?.build()}>Retry</Button> : ''
            const status = <Stack direction='row'><Typography minWidth='10em' fontSize='0.9em' paddingTop='8px' color={statusColor}>App updates: {serverUpdateStatus.toString()}</Typography>{retryButton}</Stack>
            const EditorHeader = <Box flex='0'>
                <EditorMenuBar {...{
                    onNew, onOpen, onSaveAs, onOpenFromGitHub, onUpdateFromGitHub, onSaveToGitHub, signedIn,
                    onInsert: onMenuInsert,
                    insertMenuItems,
                    onAction,
                    actionsAvailableFn: actionsAvailableFnNoInsert,
                    itemNameFn,
                    selectedItemIds, onHelp,
                    toolItems,
                    status
                }}/>
            </Box>

            const toolsOpen = tools.length > 0
            const editorHeight = toolsOpen ? (showTools ? '60%' : 'calc(100% - 50px)') : '100%'
            const toolsHeight = toolsOpen ? (showTools ? '40%' : '50px') : '0px'
            return <Box height='100%' width='100%'>
                <Box height={editorHeight}>
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
                <Box height={toolsHeight}>
                    <ToolTabsPanel tools={tools} selectedTool={selectedTool!}
                                   toolsShown={showTools}
                                   onSelectTool={setSelectedTool} onShowTools={setShowTools} onCloseTool={onCloseTool}/>
                </Box>
            </Box>
        } else if (openFromGitHubUrl) {
            return <Typography variant='h6' sx={{m: 3}}>Opening project...</Typography>
        } else {
            return <ProjectOpener onNew={onNew} onOpen={onOpen} onGetFromGitHub={onGetFromGitHub} onOpenFromGitHub={onOpenFromGitHub}/>
        }
    }

    return <ThemeProvider theme={theme}>
        {alertMessage}
        {dialog}
        {mainContent()}
    </ThemeProvider>
}

