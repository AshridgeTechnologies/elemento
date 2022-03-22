import React, {ReactElement} from 'react'
import {createTheme, ThemeProvider} from '@mui/material/styles'
import ReactDOM from 'react-dom'
import {Alert, AlertTitle} from '@mui/material'
import Editor from './Editor'
import {editorInitialProject} from '../util/welcomeProject'
import {loadJSONFromString} from '../model/loadJSON'
import {ElementId, ElementType} from '../model/Types'
import {AppElementAction} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import Project from '../model/Project'

let theProject = editorInitialProject()
let loadedFileHandle: any = null
let errorMessage: ReactElement | null = null

declare global {
    var project: () => Project
    var setProject: (project: Project) => void
    var setProjectFromJSONString: (projectJson: string) => void
}
export function project() { return theProject }
export function setProject(project: Project) {
    theProject = project
    doRender()
}
export function setProjectFromJSONString(projectJson: string) {
    setProject(loadJSONFromString(projectJson) as Project)
}

window.project = project
window.setProject = setProject
window.setProjectFromJSONString = setProjectFromJSONString

const onPropertyChange = (id: ElementId, propertyName: string, value: any)=> {
    theProject = theProject.set(id, propertyName, value)
    doRender()
}

const onInsert = (idAfter: ElementId, elementType: ElementType)=> {
    const [newProject, newElement] = theProject.insert(idAfter, elementType)
    theProject = newProject
    doRender()
    return newElement.id
}

const onAction = (id: ElementId, action: AppElementAction) => {
    const doAction = (): Project => {
        switch (action) {
            case 'delete':
                return theProject.delete(id)
            default:
                throw new UnsupportedValueError(action)
        }
    }

    theProject = doAction()
    doRender()
}

const userCancelledFilePick = (e:any) => e instanceof DOMException && e.name === 'AbortError'

const showError = function (title: string, message: string, detail: string) {
    const removeError = () => {
        errorMessage = null
        doRender()
    }
    errorMessage = (<Alert severity="error" onClose={removeError}>
        <AlertTitle>{title}</AlertTitle>
        <p id='errorMessage'>{message}</p>
        <p>{detail}</p>
    </Alert>)
    doRender()
}

const onOpen = async () => {
    let file: any
    try {
        // @ts-ignore
        const [fileHandle] = await window.showOpenFilePicker()
        file = await fileHandle.getFile()
        const jsonText = await file.text()
        setProjectFromJSONString(jsonText)
        loadedFileHandle = fileHandle
    } catch (e: any) {
        if (userCancelledFilePick(e)) {
            return
        }
        showError(`Error opening project file ${file?.name}`,
            'This file does not contain a valid Elemento project',
            `Error message: ${e.message}`)
    }
}

const writeProjectToFile = async function (fileHandle: any) {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(theProject));
    await writable.close();
}

const onSave = async () => {
    if (loadedFileHandle) {
        await writeProjectToFile(loadedFileHandle)
    } else {
        await onSaveAs()
    }
}

const onSaveAs = async () => {
    const options = {
        types: [
            {
                description: 'Project JSON Files',
                accept: {
                    'projectlication/json': ['.json'],
                },
            },
        ],
    };
    try { // @ts-ignore
        const fileHandle = await window.showSaveFilePicker(options)
        if (fileHandle) {
            await writeProjectToFile(fileHandle)
            loadedFileHandle = fileHandle
        }
    } catch (e: any) {
        if (!userCancelledFilePick(e)) {
            throw e
        }
    }
}

function doRender() {
    const theme = createTheme({
        palette: {
            primary: {
                main: '#0098a0',
            },
            secondary: {
                main: '#7e28ff',
            },
        },

        components: {
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        fontSize: '0.85rem',
                    },
                },
            },
        }
    })
    ReactDOM.render(
        <ThemeProvider theme={theme}>
            {errorMessage}
            <Editor project={theProject} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction} onOpen={onOpen} onSave={onSave}/>
        </ThemeProvider>,
        document.getElementById('main')
    )
}

doRender()
