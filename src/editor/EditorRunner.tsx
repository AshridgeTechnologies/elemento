import ProjectHandler from './ProjectHandler'
import React, {useEffect, useRef, useState} from 'react'
//@ts-ignore
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {ActionsAvailableFn, AppElementAction, AppElementActionName, VoidFn} from './Types'
import {AlertColor, Box, Button, Grid, Link, Stack, Typography,} from '@mui/material'
import {default as ModelElement} from '../model/Element'
import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'
import {theme} from '../appsShared/styling'
import {DiskProjectStore} from './DiskProjectStore'
import GitProjectStore from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {gitHubAccessToken, gitHubUsername, isSignedIn, signIn, useGitHubSignInState} from '../appsShared/gitHubAuthentication'
import {GetFromGitHubDialog} from './actions/GetFromGitHub'
import {AlertMessage, openFromGitHub, UIManager} from './actions/actionHelpers'
import {ASSET_DIR} from '../shared/constants'
import {wait, waitUntil} from '../util/helpers'
import ProjectOpener from './ProjectOpener'
import EditorManager from './actions/EditorManager'
import lodash, {startCase} from 'lodash'
import {NewProjectDialog} from './actions/NewProject'
import ProjectBuilder from '../generator/ProjectBuilder'
import BrowserProjectLoader from '../generator/BrowserProjectLoader'
import DiskProjectStoreFileLoader from './DiskProjectStoreFileLoader'
import MultiFileWriter from '../generator/MultiFileWriter'
import DiskProjectStoreFileWriter from './DiskProjectStoreFileWriter'
import App from '../model/App'
import Tool from '../model/Tool'
import PreviewPanel from './PreviewPanel'
import AppBar from '../appsShared/AppBar'
import EditorMenuBar from './EditorMenuBar'
import {equals, last, without} from 'ramda'
import {UploadDialog} from './UploadDialog'
import {CreateGitHubRepoDialog} from './CreateGitHubRepoDialog'
import {CommitDialog} from './CommitDialog'
import ToolImport from '../model/ToolImport'
import ToolTabsPanel from './ToolTabsPanel'
import EditorController from '../editorToolApis/EditorController'
import {editorDialogContainer} from './EditorElement'
import PreviewController from '../editorToolApis/PreviewController'
import {OpenFromGitHubDialog} from './actions/OpenFromGitHub'
import {SaveAsDialog} from './actions/SaveAs'
import {OpenDialog} from './actions/Open'
import SettingsHandler from './SettingsHandler'
import {exposeFunctions} from '../editorToolApis/postmsgRpc/server'
import {Status} from './ThrottledCombinedFileWriter'
import ServerMultiFileWriter from './ServerMultiFileWriter'
import {PanelTitle} from './PanelTitle'
import {OpenInNew} from '@mui/icons-material'

const {debounce} = lodash

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

const saveAndBuild = async (updatedProject: Project, projectStore: DiskProjectStore, projectBuilder: ProjectBuilder, onErrorChange: VoidFn, projectId: string) => {
    await projectStore.writeProjectFile(updatedProject.withoutFiles())
    const previousErrors = projectBuilder.errors
    projectBuilder.buildProjectFiles()
    if (!equals(projectBuilder.errors, previousErrors)) {
        onErrorChange()
    }
    await projectBuilder.writeProjectFiles()
    navigator.serviceWorker.controller!.postMessage({type: 'projectUpdated', projectId})
}

const debouncedSaveAndBuild = debounce(saveAndBuild, 100)

const helpToolImport = new ToolImport('helpTool', 'Help', {source: '/help/?header=0'})
const tutorialsToolImport = new ToolImport('tutorialsTool', 'Tutorials', {source: '/help/tutorials/?header=0'})
const inspectorImport = new ToolImport('inspectorTool', 'Inspector', {source: '/inspector'})
const firebaseToolImport = new ToolImport('firebaseTool', 'Firebase', {source: '/firebaseDeploy'})

function ServerUpdateStatus({status, projectBuilder}: {status: "waiting" | "updating" | "complete" | Error, projectBuilder?: ProjectBuilder}) {
    const isErrorStatus = status instanceof Error
    const statusColor = isErrorStatus ? 'error' : 'inherit'
    const statusText = isErrorStatus ? 'error' : status
    const retryButton = isErrorStatus ? <Button onClick={() => projectBuilder?.build()}>Retry</Button> : null
    return <Stack direction='row'>
        <Typography minWidth='10em' fontSize='0.9em' paddingTop='8px' color={statusColor}>App updates: {statusText}</Typography>
        {retryButton}
    </Stack>
}

let updateCount = 0

export default function EditorRunner() {
    const [projectHandler] = useState<ProjectHandler>(new ProjectHandler())
    const [serverUpdateStatus, setServerUpdateStatus] = useState<Status>('complete')

    const [gitHubUrl, setGitHubUrl] = useState<string | null>('')
    const [openFromGitHubUrl, setOpenFromGitHubUrl] = useState<string | null>('')
    const [, setUpdateCount] = useState(0)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const [tools, setTools] = useState<(Tool | ToolImport)[]>([])
    const [selectedToolId, setSelectedToolId] = useState<string | null>(null)
    const [showTools, setShowTools] = useState<boolean>(false)
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const projectStoreRef = useRef<DiskProjectStore>()
    const projectIdRef = useRef<string>()
    const projectBuilderRef = useRef<ProjectBuilder>()
    const editorControllerRef = useRef<EditorController>()
    const previewFrameRef = useRef<HTMLIFrameElement>(null)

    const projectStore = ()=> projectStoreRef.current!
    const updateUI = ()=> setUpdateCount(++updateCount)

    const removeDialog = () => setDialog(null)

    const getOpenProject = (): Project => {
        if (!projectHandler.current) {
            throw new Error('No current project open')
        }

        return projectHandler.current
    }

    const updateProjectAndSave = () => {
        const updatedProject = getOpenProject()
        updateUI()
        debouncedSaveAndBuild(updatedProject, projectStore(), projectBuilderRef.current!, updateUI, projectIdRef.current!)
    }

    const getPreviewFirebaseProject = ()=> (projectHandler.getSettings('firebase') as any).previewFirebaseProject
    const getPreviewPassword = ()=> (projectHandler.getSettings('firebase') as any).previewPassword
    const getElementoServerUrl = ()=> `https://${getPreviewFirebaseProject()}.web.app`
    const previewUploadUrl = () => `${getElementoServerUrl()}/preview`
    const updatePreviewUrlFromSettings = () => setPreviewServerUrl(previewUploadUrl())

    const updateProjectHandlerFromStore = async (proj: Project, name: string, projectStore: DiskProjectStore) => {
        const settingsHandler = await SettingsHandler.new(projectStore, updatePreviewUrlFromSettings)
        projectHandler.setProject(proj, name, settingsHandler)
        updatePreviewUrlFromSettings()
        await projectBuilderRef.current?.build()
        console.log('Project build complete')
        updateUI()

        const gitProjectStore = new GitProjectStore(projectStore.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote().then(setGitHubUrl)
    }

    const onServerUpdateStatusChange = (newStatus: Status) => {
        if (newStatus === 'complete') {
            // experimental fix: suspect preview url is being sent to service worker before it is ready in some cases, so do it again here
            updatePreviewUrlFromSettings()
            wait(50).then(refreshServerAppConnectors)
        }

        if (newStatus instanceof Error) {
            showAlert('Server App Preview', 'Failed to update preview server', newStatus.message, 'error')
        }

        setServerUpdateStatus(newStatus)
    }

    const newProjectBuilder = (projectStore: DiskProjectStore) => {
        const projectInfoFileWriter = new MultiFileWriter(
            new DiskProjectStoreFileWriter(projectStore, 'dist')
        )
        const clientFileWriter = new MultiFileWriter(
            new DiskProjectStoreFileWriter(projectStore, 'dist/client'),
        )
        const toolFileWriter = new MultiFileWriter(
            new DiskProjectStoreFileWriter(projectStore, 'dist/client/tools'),
        )

        const serverFileWriter = new ServerMultiFileWriter({
            previewUploadUrl,
            previewPassword: getPreviewPassword,
            onServerUpdateStatusChange,
            writers: [new DiskProjectStoreFileWriter(projectStore, 'dist/server')]
        })

        return new ProjectBuilder({
            projectLoader: new BrowserProjectLoader(() => getOpenProject()),
            fileLoader: new DiskProjectStoreFileLoader(projectStore),
            projectInfoFileWriter,
            clientFileWriter,
            toolFileWriter,
            serverFileWriter,
        })
    }

    async function openOrUpdateProjectFromStore(name: string, projectStore: DiskProjectStore) {
        const projectWorkingCopy = await projectStore.getProject()
        const project = projectWorkingCopy.projectWithFiles
        projectBuilderRef.current = newProjectBuilder(projectStore)
        await updateProjectHandlerFromStore(project, name, projectStore)
        projectStoreRef.current = projectStore
        projectIdRef.current = name.replace(/ /g, '-') + '-' + Date.now()

        const toolsToKeep = tools.filter( tool => tool.kind === 'ToolImport')
        setTools(toolsToKeep)
        const selectedToolIsStillOpen = toolsToKeep.some( tool => tool.id === selectedToolId)
        if (!selectedToolIsStillOpen) {
            setSelectedToolId(toolsToKeep[0]?.id ?? null)
        }
    }

    function refreshServerAppConnectors() {
        const serverAppConnectorIds = getOpenProject().findElementsBy(el => el.kind === 'ServerAppConnector').map( el => el.id)
        const paths = serverAppConnectorIds.map( id => getOpenProject().findElementPath(id))
        paths.map( id => callFunctionInPreview(id!, 'Refresh'))
    }

    function selectItemsInPreview(ids: string[]) {
        const idsWithinApp = ids.map( id => id.replace(/^Tools\./, ''))
        navigator.serviceWorker.controller!.postMessage({type: 'editorHighlight', ids: idsWithinApp})
    }

    function callFunctionInPreview(componentId: string, functionName: string, args: any[] = []) {
        navigator.serviceWorker.controller!.postMessage({type: 'callFunction', componentId, functionName, args})
    }

    function setPreviewServerUrl(url: string) {
        console.log('setPreviewServerUrl', url)
        navigator.serviceWorker.controller!.postMessage({type: 'previewServer', url})
    }

    function setDirHandleInServiceWorker(projectId: string, dirHandle: FileSystemDirectoryHandle) {
        console.log('setDirHandleInServiceWorker', dirHandle)
        navigator.serviceWorker.controller!.postMessage({type: 'projectStore', projectId, dirHandle})
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

        const doInit = () => {
            console.log('Initializing service worker')
            navigator.serviceWorker.onmessage = (event) => {
                const message = event.data
                if (message.type === 'componentSelected') {
                    const {id} = message
                    const selectedItem = getOpenProject().findElementByPath(id)
                    onSelectedItemsChange(selectedItem ? [selectedItem.id] : [])
                }
                if (message.type === 'dirHandleRequest') {
                    if (projectIdRef.current && message.projectId === projectIdRef.current && projectStoreRef.current) {
                        setDirHandleInServiceWorker(projectIdRef.current, projectStoreRef.current?.dirHandle)
                    }
                }
            }
        }

        waitUntil(() => navigator.serviceWorker.controller, 500, 5000).then(() => doInit())
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

    const exposeEditorController = (gitHubUrl: string | null, projectHandler: ProjectHandler) => {
        const container = editorDialogContainer()
        if (container) {
            const controller = new EditorController(container, gitHubUrl, projectHandler)
            editorControllerRef.current = controller
            const closeFn = exposeFunctions('Editor', controller)
            console.log('Editor controller initialised')
            return closeFn
        }
    }

    const exposePreviewController = (previewFrame: HTMLIFrameElement | null) => {
        const previewWindow = previewFrame?.contentWindow

        if (previewWindow) {
            const controller = new PreviewController(previewWindow)
            const closeFn = exposeFunctions('Preview', controller)
            console.log('Preview controller initialised')
            return closeFn
        }
    }

    const openInitialTools = () => {
        const searchParams = new URLSearchParams(location.search)
        const toolUrls = searchParams.getAll('tool')
        toolUrls.forEach( url => showTool(toolImportFromUrl(url)))
    }

    const sendSelectionToTools = ()=> document.addEventListener('selectionchange', ()=> {
        const selectedText = document.getSelection()?.toString() ?? ''
        return editorControllerRef.current?.setSelectedText(selectedText)
    })

    useEffect(() => {
        window.setProject = (project: string | Project) => {
            const proj = typeof project === 'string' ? loadJSONFromString(project) as Project : project
            updateProjectHandlerFromStore(proj, 'Test project', projectStore())
        }
        window.getProject = () => projectHandler.current
    })
    useEffect(initServiceWorker, [])
    useEffect(() => exposeEditorController(gitHubUrl, projectHandler), [gitHubUrl, projectHandler, editorDialogContainer()])
    useEffect(() => exposePreviewController(previewFrameRef.current), [previewFrameRef.current])
    useEffect(openInitialTools, [])
    useEffect(sendSelectionToTools, [])

    const isFileElement = (id: ElementId) => getOpenProject().findElement(id)?.kind === 'File'
    const itemNameFn = (id: ElementId) => getOpenProject().findElement(id)?.name ?? id
    const toolImportFromUrl = (url: string) => {
        const ownOrigin = window.location.origin
        const getUrl = () => {
            try {
                return new URL(url, ownOrigin)
            } catch (e: any) {
                return new URL('/notFound', ownOrigin)
            }
        }
        const theUrl = getUrl()
        const id = url.replace(/\W/g, '')
        const name = startCase(last(theUrl.pathname.split('/')))
        const studioAccess = theUrl.origin === ownOrigin
        return new ToolImport(id, name, {source: url, studioAccess})
    }
    const actionsAvailableFn: ActionsAvailableFn = (ids: ElementId[]): AppElementAction[] => getOpenProject().actionsAvailable(ids)
    const actionsAvailableFnNoInsert: ActionsAvailableFn = (ids: ElementId[]): AppElementAction[] => without(['insert'], actionsAvailableFn(ids))

    async function renameAsset(element: ModelElement, value: any) {
        const oldName = element.name
        const newName = value
        await projectStore().renameAsset(oldName, newName)
        const gitProjectStore = new GitProjectStore(projectStore().fileSystem, http, null, null)
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
                await projectStore().writeAssetFile(name, data)
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
        const gitProjectStore = new GitProjectStore(projectStore().fileSystem, http, null, null)

        return Promise.all(fileIds.map(async id => {
            const filename = getOpenProject().findElement(id)?.name
            if (filename) {
                await projectStore().deleteAssetFile(filename)
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
            const newElementIds = await projectHandler.elementAction(ids, action.toString() as AppElementActionName)
            updateProjectAndSave()
            if (newElementIds) {
                onSelectedItemsChange(newElementIds)
            }
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
                                                    currentProjectStore={projectStore()}/>)

    const onOpen = async () => {
        setDialog(<OpenDialog editorManager={new EditorManager(openOrUpdateProjectFromStore)}
                              uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)
    }

    const onHelp = () => showTool(helpToolImport)
    const onTutorials = () => showTool(tutorialsToolImport)
    const onOpenTool = (url: string) => showTool(toolImportFromUrl(url))
    const onReload = ()=> openOrUpdateProjectFromStore(projectHandler.name!, projectStore())
    const onFirebase = () => showTool(firebaseToolImport)
    const onInspector = () => showTool(inspectorImport)

    const onGetFromGitHub = () => setDialog(<GetFromGitHubDialog
        editorManager={new EditorManager(openOrUpdateProjectFromStore)}
        uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onOpenFromGitHub = () => setDialog(<OpenFromGitHubDialog
        editorManager={new EditorManager(openOrUpdateProjectFromStore)}
        uiManager={new UIManager({onClose: removeDialog, showAlert})}/>)

    const onUpdateFromGitHub = async () => {
        console.log('Update from GitHub')
        const fs = projectStore().fileSystem
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
        const projectWorkingCopy = await projectStore().getProject()
        await updateProjectHandlerFromStore(projectWorkingCopy.projectWithFiles, projectName, projectStore())
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
        const fs = projectStore().fileSystem
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
        editorControllerRef.current?.setSelectedItemId(ids[0])
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
            setTools(tools => tools.concat(tool))
        }
        setSelectedToolId(tool.id)
        setShowTools(true)
    }

    const onCloseTool = (toolId: string) => {
        const oldToolIndex = tools.findIndex(t => t.id === toolId)
        const newTools = tools.filter(t => t.id !== toolId)
        setTools(newTools)
        if (toolId === selectedToolId) {
            const nextToolIndex = Math.min(oldToolIndex, newTools.length - 1)
            if (nextToolIndex >= 0) {
                setSelectedToolId(newTools[nextToolIndex].id)
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

    const onMenuInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => {
        const newElementId = onInsert(insertPosition, targetElementId, elementType)
        onSelectedItemsChange([newElementId])
    }

    const signedIn = useGitHubSignInState()

    function mainContent() {

        const toolsOpen = tools.length > 0
        const editorHeight = toolsOpen ? (showTools ? '60%' : 'calc(100% - 50px)') : '100%'
        const toolsHeight = toolsOpen ? (showTools ? '40%' : '50px') : '0px'

        function toolTabsPanel() {
            return <ToolTabsPanel tools={tools} selectedTool={selectedToolId!}
                                  toolsShown={showTools}
                                  onSelectTool={setSelectedToolId} onShowTools={setShowTools} onCloseTool={onCloseTool} projectId={projectIdRef.current!}/>
        }

        if (projectHandler.current) {
            const project = getOpenProject()
            const onUpdateFromGitHubProp = gitHubUrl ? onUpdateFromGitHub : undefined
            const appName = () => project.findChildElements(App)[0]?.codeName
            const runUrl = gitHubUrl ? window.location.origin + `/run/gh/${gitHubUrl.replace('https://github.com/', '')}/${appName()}` : undefined
            const previewUrl = `/studio/preview/${projectIdRef.current}/${appName()}/`
            const errors = projectBuilderRef.current?.errors ?? {}
            const projectStoreName = projectHandler.name!
            const insertMenuItems = project.insertMenuItems.bind(project)

            const projectTools = Object.fromEntries(
                project.findElementsBy( el => el.kind === 'Tool' || el.kind === 'ToolImport')
                .map( el => [el.name, ()=> showTool(el as Tool | ToolImport)]))
            const toolItems = {
                'Inspector': onInspector,
                'Firebase': onFirebase,
                ...projectTools
            }

            const appBarTitle = `Elemento Studio - ${projectStoreName}`
            const OverallAppBar = <Box flex='0'>
                <AppBar title={appBarTitle}/>
            </Box>
            const status = project.hasServerApps ? ServerUpdateStatus({status: serverUpdateStatus, projectBuilder: projectBuilderRef.current}) : null
            const EditorHeader = <Box flex='0'>
                <EditorMenuBar {...{
                    onNew, onOpen, onReload, onSaveAs, onOpenFromGitHub, onUpdateFromGitHub, onSaveToGitHub, signedIn,
                    onInsert: onMenuInsert,
                    insertMenuItems,
                    onAction,
                    actionsAvailableFn: actionsAvailableFnNoInsert,
                    itemNameFn,
                    selectedItemIds, onHelp, onTutorials, onOpenTool,
                    toolItems,
                    status
                }}/>
            </Box>

            return <Box height='100%' width='100%'>
                <Box height={editorHeight}>
                    <Box display='flex' flexDirection='column' height='100%' width='100%' onKeyDown={keyHandler}
                         tabIndex={-1}>
                        {OverallAppBar}
                        <Box flex='1' minHeight={0}>
                            <Grid container columns={20} spacing={0} height='100%'>
                                <Grid item xs={10} height='100%'>
                                    <Box display='flex' flexDirection='column' height='100%' width='100%'
                                         id='editorMain' className='editorDialogContainer' position='relative'>
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
                                    <PanelTitle name='Preview'>
                                        <Link href={previewUrl} target='elementoPreview' aria-label="open in new window" title="open in new window" color='inherit'>
                                            <Typography sx={{px: 2, py: 0.5}}>Open in new window</Typography>
                                        </Link>
                                        {runUrl ? <Link href={runUrl} target='elementoPublishedApp' aria-label="open app from GitHub" title="open app from GitHub" color='inherit'>
                                            <Typography sx={{px: 2, py: 0.5}}>Open from GitHub</Typography>
                                        </Link> : null
                                        }
                                    </PanelTitle>
                                    <PreviewPanel height='calc(100% - 32px)'
                                        preview={
                                            <iframe name='appFrame' src={previewUrl} ref={previewFrameRef}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none',
                                                        backgroundColor: 'white'
                                                    }}/>
                                        }/>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Box>
                <Box height={toolsHeight}>
                    {toolTabsPanel()}
                </Box>
            </Box>
        } else if (openFromGitHubUrl) {
            return <Typography variant='h6' sx={{m: 3}}>Opening project...</Typography>
        } else {
            return <Box height='100%' width='100%'>
                <Box height={editorHeight}>
                    <ProjectOpener onNew={onNew} onOpen={onOpen} onGetFromGitHub={onGetFromGitHub} onOpenFromGitHub={onOpenFromGitHub}
                                   onOpenTool={onOpenTool} onHelp={onHelp} onTutorials={onTutorials}/>
                </Box>
                <Box height={toolsHeight}>
                    {toolTabsPanel()}
                </Box>
            </Box>
        }
    }

    return <ThemeProvider theme={theme}>
        {alertMessage}
        {dialog}
        {mainContent()}
    </ThemeProvider>
}

