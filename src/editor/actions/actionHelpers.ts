import React, {ChangeEvent, useState} from 'react'
import {AlertColor} from '@mui/material'
import EditorManager from './EditorManager'
import {projectFileName} from '../../shared/constants'

export type ShowAlertFn = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => void

export type Optional<T> = {
    [Property in keyof T]+?: T[Property];
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
    return dirEntry.value ? 'Directory is not empty' : null
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