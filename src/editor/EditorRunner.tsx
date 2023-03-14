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
import {editorEmptyProject} from '../util/initialProjects'
import GitProjectStore from './GitProjectStore'
import http from 'isomorphic-git/http/web'
import {CloseButton} from './actions/ActionComponents'
import {PopupMessage, validateProjectName} from './actions/actionHelpers'
import {WebContainer} from '@webcontainer/api'
import {previewClientFiles, previewCodeFile, previewFiles} from './previewFiles'
import {ASSET_DIR} from '../shared/constants'
import {waitUntil} from '../util/helpers'


declare global {
    var getProject: () => Project
    var setProject: (project: string|Project) => void
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
export default function EditorRunner() {
    const [editorId] = useState(Date.now())
    const [projectHandler] = useState<ProjectHandler>(new ProjectHandler())
    const [projectFileStore] = useState<ProjectFileStore>(new ProjectFileStore(projectHandler))
    const [localProjectStore] = useState<LocalProjectStore>(new LocalProjectStoreIDB())
    const webContainerRef = useRef<WebContainer>()
    const serverProcessRef = useRef<any>()
    const [webContainerUrl, setWebContainerUrl] = useState<string>('')
    const [updateTime, setUpdateTime] = useState<number | null>(null)

    const [gitHubUrl, setGitHubUrl] = useState<string | null>('')
    const [project, setProject] = useState<Project>(projectHandler.current)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    // const [popup, setPopup] = useState<Window | null>(null)
    const popupRef = useRef(false)
    const removeDialog = () => setDialog(null)

    const updateProjectAndSave = () => {
        const updatedProject = projectHandler.current
        setProject(updatedProject)
        localProjectStore.writeProjectFile(projectHandler.name, updatedProject.withoutFiles())

        const [path, fileContents] = previewCodeFile(updatedProject)
        writeFile(path, fileContents)
    }

    const updateProjectHandler = async (proj: Project, name: string) => {
        projectHandler.setProject(proj)
        projectHandler.name = name
        setProject(proj)
        const filesToMount = await previewClientFiles(projectHandler.current, projectHandler.name, window.location.origin)
        console.log('re-mounting files', filesToMount)
        mountFiles(filesToMount)
        setUpdateTime(Date.now())

        const gitProjectStore = new GitProjectStore(localProjectStore.fileSystem, http, null, null)
        gitProjectStore.getOriginRemote(name).then(setGitHubUrl)
    }

    async function openOrUpdateProject(name: string) {
        const projectWorkingCopy = await localProjectStore.getProject(name)
        const project = projectWorkingCopy.projectWithFiles
        await updateProjectHandler(project, name)
    }
    async function sendMessage(message: object) {
        const serverProcess = serverProcessRef.current
        if (!serverProcess) return
        const writableStream = serverProcess.input
        const defaultWriter = writableStream.getWriter();
        await defaultWriter.ready
        await defaultWriter.write('WS:' + JSON.stringify(message) + '\n')
        await defaultWriter.ready
        defaultWriter.releaseLock()
    }

    const initWebContainer = () => {
        const doInit = async function () {
            const webContainer = await WebContainer.boot()
            console.log('webContainer', webContainer)
            const filesToMount = await previewFiles(projectHandler.current, projectHandler.name, window.location.origin)
            console.log('filesToMount', filesToMount)
            await webContainer.mount(filesToMount)

            console.log('Starting server')
            const serverProcess = await webContainer.spawn('node', ['devServer.cjs'])

            async function receiveMessagesFromServerOutput() {
                const reader = serverProcess!.output.getReader()
                let value = null, done = false
                const escapeCodeRegex = /\[\w\w\w?/g
                const startingNonPrintableRegex = /^\W*/
                for (; !done; {value, done} = await reader.read()) {
                    const line = value?.trim().replace(escapeCodeRegex, '').replace(startingNonPrintableRegex, '')
                    if (line && line.length > 1) {
                        if (line.startsWith('WS:')) {
                            const messageLine = line.replace(/^WS: */, '')
                            const message = JSON.parse(messageLine)
                            if (message.type === 'componentSelected') {
                                const {id} = message
                                const selectedItem = projectHandler.current.findElementByPath(id)
                                onSelectedItemsChange(selectedItem ? [selectedItem.id] : [])
                            }
                        } else {
                            console.log('Server output:', line?.trim())
                        }
                    }
                }

            }

            receiveMessagesFromServerOutput()

            webContainer.on('server-ready', (port, url) => {
                console.log('Server ready', 'port', port, 'url', url)
                webContainerRef.current = webContainer
                serverProcessRef.current = serverProcess
                setWebContainerUrl(url)
                // window.wcfs = webContainer.fs
            })
            webContainer.on('error', error => console.error('Error in webcontainer', error))
        }
        if (!webContainerRef.current) {
            doInit().then( ()=> console.log('Web container initialized'))
        }
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
            const filesToMount = await previewClientFiles(projectHandler.current, projectHandler.name, window.location.origin)
            console.log('filesToMount', filesToMount)
            mountFiles(filesToMount)
        }

        waitUntil( ()=> navigator.serviceWorker.controller, 500, 10000 ).then(doInit).catch(() => {
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

    useEffect(() => {
        const checkForMessages = () => {
            if (!popupRef.current) return // message only expected if popup open
            const messageKey = 'msg_' + editorId
            const messageJSON = window.localStorage.getItem(messageKey)
            if (messageJSON) {
                const message = JSON.parse(messageJSON) as PopupMessage
                switch(message.type) {
                    case 'openProject':
                        openOrUpdateProject(message.projectName)
                        break
                    case 'updateProject':
                        openOrUpdateProject(message.projectName)
                        break
                    case 'operationCancelled':
                        break
                }
                popupRef.current = false
                window.localStorage.removeItem(messageKey)
            }
        }

        window.addEventListener('focus', checkForMessages)
        return ()=> window.removeEventListener('focus', checkForMessages)
    }, [])

    const isFileElement = (id: ElementId) => projectHandler.current.findElement(id)?.kind === 'File'

    const onPropertyChange = async (id: ElementId, propertyName: string, value: any) => {
        const element = projectHandler.current.findElement(id)!
        if (element.kind === 'File' && propertyName === 'name') {
            const projectName = projectHandler.name
            await localProjectStore.renameAsset(projectName, element.name, value)
            const gitProjectStore = new GitProjectStore(localProjectStore.fileSystem, http, null, null)
            await gitProjectStore.rename(projectName, ASSET_DIR + '/' + element.name, ASSET_DIR + '/' + value)
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
                await localProjectStore.writeAssetFile(projectHandler.name, name, data)
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
                await localProjectStore.deleteAssetFile(projectName, filename)
                await gitProjectStore.deleteFile(projectName , ASSET_DIR + '/' + filename)
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
            await updateProjectHandler(editorEmptyProject().withFiles(), name)
            await localProjectStore.writeProjectFile(name, projectHandler.current.withoutFiles())
            removeDialog()
        }

        setDialog(<NewDialog onClose={removeDialog} onCreate={onProjectCreated} existingNames={existingProjectNames}/>)
    }

    const onOpen = async () => {
        const names = await localProjectStore.getProjectNames()
        const onProjectSelected = async (name: string) => {
            await openOrUpdateProject(name)
            removeDialog()
        }

        setDialog(<OpenDialog names={names} onClose={removeDialog} onSelect={onProjectSelected}/>)
    }


    const onExport = async () => {
        await projectFileStore.saveFileAs()
    }

    const onGetFromGitHub = () => openGitHubPopup('get')

    const onUpdateFromGitHub = async() => openGitHubPopup('update', projectHandler.name)
    const onSaveToGitHub = () => openGitHubPopup('save', projectHandler.name)

    const openGitHubPopup = (action: string, projectName: string = '') => {
        const popupWidth = 600
        const popupLeft = window.screenX + window.outerWidth/2 - popupWidth/2
        const popupTop = window.screenY + 200
        const popup = window.open(`/studio/github.html?editorId=${editorId}&action=${action}&projectName=${projectName}`,
            'elemento_github', `popup,left=${popupLeft},top=${popupTop},width=${popupWidth},height=600`)
        popupRef.current = true
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
        const pathIds = ids.map( id => projectHandler.current.findElementPath(id)).filter(id => id !== null) as string[]
        selectItemsInPreview(pathIds)
    }

    const onUpdateFromGitHubProp = gitHubUrl ? onUpdateFromGitHub : undefined
    const runUrl = gitHubUrl ? window.location.origin + `/run/gh/${gitHubUrl.replace('https://github.com/', '')}` : undefined
    const previewUrl = updateTime ? `/preview/?v=${updateTime}` : '/preview/'
    return <ThemeProvider theme={theme}>
            {alertMessage}
            {dialog}
            <Editor project={projectHandler.current} projectStoreName={projectHandler.name}
                    onChange={onPropertyChange} onInsert={onInsert} onMove={onMove} onAction={onAction}
                    onNew={onNew} onOpen={onOpen}
                    onExport={onExport}
                    onGetFromGitHub={onGetFromGitHub} onSaveToGitHub={onSaveToGitHub} onUpdateFromGitHub={onUpdateFromGitHubProp}
                    runUrl={runUrl} previewUrl={previewUrl}
                    selectedItemIds={selectedItemIds} onSelectedItemsChange={onSelectedItemsChange}
            />
        </ThemeProvider>
}