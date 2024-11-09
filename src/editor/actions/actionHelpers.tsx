import React, {ChangeEvent, ReactNode, useState} from 'react'
import {Alert, AlertColor, AlertTitle} from '@mui/material'
import EditorManager from './EditorManager'
import {ASSET_DIR, projectFileName} from '../../shared/constants'

const OPFS_PROJECTS_DIR = 'Projects'

export type ShowAlertFn = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => void

export type Optional<T> = {
    [Property in keyof T]+?: T[Property]
}

export async function chooseDirectory(): Promise<FileSystemDirectoryHandle | null> {
    return window.showDirectoryPicker({id: 'elemento_editor', mode: 'readwrite'}).catch(e => {
            if (userCancelledFilePick(e)) {
                return null
            }
            throw e
        })
}

export async function validateDirectory(directory: FileSystemDirectoryHandle | null) {
    // @ts-ignore
    const dirEntry = await directory?.keys().next()
    return dirEntry.value ? 'Folder is not empty' : null
}

export async function validateDirectoryForOpen(directory: FileSystemDirectoryHandle | null) {
    if (!directory) return null
    try {
        await directory.getFileHandle(projectFileName)
        return null
    } catch (e) {
        return `Directory '${directory.name}' does not contain an Elemento project file`
    }
}

export const onChangeValue = (onChangeFn: (val: string) => void) => (event: ChangeEvent) => onChangeFn((event.target as HTMLInputElement).value)

export class UIManager {
    readonly onClose: () => void
    readonly showAlert: ShowAlertFn
    constructor(props: {onClose: () => void, showAlert: ShowAlertFn}) {
        this.onClose = props.onClose
        this.showAlert = props.showAlert
    }
}

type StateClass<T> = { new(props: { editorManager: EditorManager, uiManager: UIManager }, onUpdate: (t: T) => void): T }

export function useDialogState<T>(stateClass: StateClass<T>, editorManager: EditorManager, uiManager: UIManager) {
    const onUpdate = (newState: T) => setState(newState)
    const [state, setState] = useState(() => new stateClass({editorManager, uiManager}, onUpdate))
    return state
}

export const doAction = (uiManager: UIManager, description: string, actionFn: () => (void)) => async () => {
    try {
        await actionFn()
    } catch (e: any) {
        console.error('Error in ' + description, e)
        uiManager.showAlert(description, `Message: ${e.message}`, null, 'error')
    }
    uiManager.onClose()
}
export const userCancelledFilePick = (e: any) => /*e instanceof DOMException &&*/ e.name === 'AbortError'

export const internalProjectsDir = async () => {
    const opfsRoot = await navigator.storage.getDirectory()
    return opfsRoot.getDirectoryHandle(OPFS_PROJECTS_DIR, {create: true})
}
export const internalProject = async (name: string) => {
    const projectsDir = await internalProjectsDir()
    return projectsDir.getDirectoryHandle(name)
}
export const openFromGitHub = async (url: string, editorManager: EditorManager) => {
    const repoName = new URL(url).pathname.substring(1)
    const tidiedRepoName = repoName.replace(/\//, '_').replace(/\.git$/, '')
    const dateTime = new Date().toISOString().substring(0,19).replace(/[:\-T]/g, '')
    const dirName = `${tidiedRepoName}_${dateTime}`
    const projectsDir = await internalProjectsDir()
    const opfsDirectory = await projectsDir.getDirectoryHandle(dirName, {create: true})
    return editorManager.getFromGitHub(url, opfsDirectory)
}

export const createNewProject = async (name: string, editorManager: EditorManager) => {
    const projectsDir = await internalProjectsDir()
    const opfsDirectory = await projectsDir.getDirectoryHandle(name, {create: true})
    return editorManager.newProject(opfsDirectory)
}

export const validateProjectName = async (name: string | null) => {
    if (!name) return 'Name cannot be empty'
    if (name.includes('/')) return 'Name cannot contain /'
    const projectsDir = await internalProjectsDir()
    let existingProject: FileSystemDirectoryHandle
    try {
        await projectsDir.getDirectoryHandle(name)
        return 'A project with this name already exists'
    } catch (e) {
        return null
    }
}

export function AlertMessage({severity, removeAlert, title, message, detail}:
                                 { severity: AlertColor, removeAlert: VoidFunction, title: string, message: string, detail: ReactNode }) {
    return <Alert severity={severity} onClose={removeAlert}>
        <AlertTitle>{title}</AlertTitle>
        <p id="alertMessage">{message}</p>
        <p>{detail}</p>
    </Alert>
}

export const loadAppNames = async (projectDir: FileSystemDirectoryHandle): Promise<string[]> => {
    const distDir = await projectDir.getDirectoryHandle('dist')
    const clientDir = await distDir.getDirectoryHandle('client')
    const result: string[] = []
    // @ts-ignore
    for await (const [name] of clientDir.entries()) {
        if (name !== ASSET_DIR) result.push(name)
    }
    return result
}
