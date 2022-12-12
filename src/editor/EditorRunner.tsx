import ProjectHandler from './ProjectHandler'
import React, {ChangeEvent, useEffect, useState} from 'react'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {AppElementAction} from './Types'
import {Alert, AlertColor, AlertTitle, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Button, IconButton, Link,} from '@mui/material'
import {camelCase} from 'lodash'
import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'
import {theme} from '../shared/styling'
import ProjectPublisher from './ProjectPublisher'
import ProjectFileStore from './ProjectFileStore'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import Close from '@mui/icons-material/Close'
import {LocalProjectStore, LocalProjectStoreIDB} from './LocalProjectStore'
import {editorEmptyProject} from '../util/initialProjects'

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

export default function EditorRunner() {
    const [projectHandler] = useState<ProjectHandler>(new ProjectHandler())
    const [projectFileStore] = useState<ProjectFileStore>(new ProjectFileStore(projectHandler))
    const [localProjectStore] = useState<LocalProjectStore>(new LocalProjectStoreIDB())
    const [project, setProject] = useState<Project>(projectHandler.current)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)
    const [dialog, setDialog] = useState<React.ReactNode | null>(null)
    const removeDialog = () => setDialog(null)

    const updateProjectAndSave = () => {
        setProject(projectHandler.current)
        localProjectStore.writeProjectFile(projectHandler.name, projectHandler.current)
    }

    const updateProjectHandler = (proj: Project, name: string) => {
        projectHandler.setProject(proj)
        projectHandler.name = name
        setProject(proj)
    }

    useEffect( () => {
        window.setProject = (project: string|Project) => {
            const proj = typeof project === 'string' ? loadJSONFromString(project) as Project : project
            updateProjectHandler(proj, 'Test project')
        }
        window.getProject = () => projectHandler.current
    })

    const onPropertyChange = (id: ElementId, propertyName: string, value: any)=> {
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

    const onAction = (ids: ElementId[], action: AppElementAction) => {
        projectHandler.elementAction(ids, action).then(updateProjectAndSave).catch( error => {
            alert(error.message)
        })
    }

    const onNew = async () => {
        const existingProjectNames = await localProjectStore.getProjectNames()
        const onProjectCreated = async (name: string) => {
            await localProjectStore.createProject(name)
            updateProjectHandler(editorEmptyProject(), name)
            await localProjectStore.writeProjectFile(name, projectHandler.current)
            removeDialog()
        }

        setDialog(<NewDialog onClose={removeDialog} onCreate={onProjectCreated} existingNames={existingProjectNames}/>)
    }

    const onOpen = async () => {
        const names = await localProjectStore.getProjectNames()
        const onProjectSelected = async (name: string) => {
            const projectWorkingCopy = await localProjectStore.getProject(name)
            updateProjectHandler(projectWorkingCopy.project, name)
            removeDialog()
        }

        setDialog(<OpenDialog names={names} onClose={removeDialog} onSelect={onProjectSelected}/>)
    }

    const onExport = async () => {
        await projectFileStore.saveFileAs()
    }

    const onPublish = async ({name, code}: {name: string, code: string}) => {
        const publishName = camelCase(name) + '.js'
        const projectPublisher = new ProjectPublisher(projectHandler.current)
        const runUrl = await projectPublisher.publish(publishName, code)
        updateProjectAndSave()
        const runLink = <Link href={runUrl} target={camelCase(name)}>{runUrl}</Link>
        showAlert(`Published ${name}`, 'You can run the app with the link below', runLink, 'success')
    }

    const showAlert = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => {
        const removeAlert = () => setAlertMessage(null)
        setAlertMessage(<Alert severity={severity} onClose={removeAlert}>
            <AlertTitle>{title}</AlertTitle>
            <p id="alertMessage">{message}</p>
            <p>{detail}</p>
        </Alert>)
    }


    return <ThemeProvider theme={theme}>
            {alertMessage}
            {dialog}
            <Editor project={project} projectStoreName={projectHandler.name}
                    onChange={onPropertyChange} onInsert={onInsert} onMove={onMove} onAction={onAction}
                    onNew={onNew} onOpen={onOpen}
                    onExport={onExport} onPublish={onPublish}/>
        </ThemeProvider>
}