import React, {ReactElement} from 'react'
import ReactDOM from 'react-dom'
import {Alert, AlertTitle} from '@mui/material'
import App from '../model/App'
import Editor from './Editor'
import {editorInitialApp} from '../util/welcomeApp'
import {loadJSONFromString} from '../model/loadJSON'
import {ElementId, ElementType} from '../model/Types'


let theApp = editorInitialApp()
let loadedFileHandle: any = null
let errorMessage: ReactElement | null = null

declare global {
    var app: () => App
    var setApp: (app: App) => void
    var setAppFromJSONString: (appJson: string) => void
}
export function app() { return theApp }
export function setApp(app: App) {
    theApp = app
    doRender()
}
export function setAppFromJSONString(appJson: string) {
    setApp(loadJSONFromString(appJson) as App)
}

window.app = app
window.setApp = setApp
window.setAppFromJSONString = setAppFromJSONString

const onPropertyChange = (id: ElementId, propertyName: string, value: any)=> {
    theApp = theApp.set(id, propertyName, value)
    doRender()
}

const onInsert = (idAfter: ElementId, elementType: ElementType)=> {
    const [newApp, newElement] = theApp.insert(idAfter, elementType)
    theApp = newApp
    doRender()
    return newElement.id
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
        setAppFromJSONString(jsonText)
        loadedFileHandle = fileHandle
    } catch (e: any) {
        if (userCancelledFilePick(e)) {
            return
        }
        showError(`Error opening app file ${file?.name}`,
            'This file does not contain a valid Elemento app',
            `Error message: ${e.message}`)
    }
}

const writeAppToFile = async function (fileHandle: any) {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(theApp));
    await writable.close();
}

const onSave = async () => {
    if (loadedFileHandle) {
        await writeAppToFile(loadedFileHandle)
    } else {
        await onSaveAs()
    }
}

const onSaveAs = async () => {
    const options = {
        types: [
            {
                description: 'App JSON Files',
                accept: {
                    'application/json': ['.json'],
                },
            },
        ],
    };
    try { // @ts-ignore
        const fileHandle = await window.showSaveFilePicker(options)
        if (fileHandle) {
            await writeAppToFile(fileHandle)
            loadedFileHandle = fileHandle
        }
    } catch (e: any) {
        if (!userCancelledFilePick(e)) {
            throw e
        }
    }
}

function doRender() {
    ReactDOM.render(
        <>
            {errorMessage}
            <Editor app={theApp} onChange={onPropertyChange} onInsert={onInsert} onOpen={onOpen} onSave={onSave}/>
        </>,
        document.getElementById('main')
    )
}

doRender()
