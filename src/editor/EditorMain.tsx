import React, {ReactElement} from 'react'
import {createRoot} from 'react-dom/client'
import {createTheme, ThemeProvider} from '@mui/material/styles'
import {Alert, AlertColor, AlertTitle, Link} from '@mui/material'
import Editor from './Editor'
import {editorInitialProject} from '../util/welcomeProject'
import {loadJSONFromString} from '../model/loadJSON'
import {ElementId, ElementType} from '../model/Types'
import {AppElementAction} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import Project from '../model/Project'
import {camelCase} from 'lodash'
import {getAuth, storage} from '../shared/configuredFirebase'
import {ref, uploadString} from 'firebase/storage'

let theProject = editorInitialProject()
let loadedFileHandle: any = null
let alertMessage: ReactElement | null = null

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

const showAlert = function (title: string, message: string, detail: React.ReactNode, severity: AlertColor) {
    const removeError = () => {
        alertMessage = null
        doRender()
    }
    alertMessage = (<Alert severity={severity} onClose={removeError}>
        <AlertTitle>{title}</AlertTitle>
        <p id="alertMessage">{message}</p>
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
        showAlert(`Error opening project file ${file?.name}`, 'This file does not contain a valid Elemento project', `Error message: ${e.message}`, 'error')
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
                    'application/json': ['.json'],
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

const onPublish = async ({name, code}: {name: string, code: string}) => {
    console.log('Publishing', name)
    const publishName = camelCase(name) + '.js'
    const user = getAuth().currentUser
    if(user === null) {
        throw new Error('Must be logged in to publish')
    }
    const publishPath = `apps/${user.uid}/${publishName}`
    const storageRef = ref(storage, publishPath)
    const metadata = {
        contentType: 'text/javascript',
    }
    await uploadString(storageRef, code, 'raw', metadata)
    const runUrl = window.location.origin + '/run/' + publishPath
    const runLink = <Link href={runUrl}>{runUrl}</Link>
    showAlert(`Published ${name}`, 'You can run the app with the link below', runLink, 'success')
    console.log('Published', publishPath, 'run URL', runUrl)
}

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


const container = document.getElementById('main')
const root = createRoot(container!)

function doRender() {
    root.render(
        <ThemeProvider theme={theme}>
            {alertMessage}
            <Editor project={theProject} onChange={onPropertyChange} onInsert={onInsert} onAction={onAction} onOpen={onOpen} onSave={onSave} onPublish={onPublish}/>
        </ThemeProvider>)
}

doRender()
