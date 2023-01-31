import React, {ChangeEvent, useState} from 'react'
import {AlertColor} from '@mui/material'
import EditorManager from './EditorManager'

export type ShowAlertFn = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => void

export type Optional<T> = {
    [Property in keyof T]+?: T[Property];
}

export function validateProjectName(name: string, existingNames: string[]) {
    if (existingNames.includes(name)) return 'There is already a project with this name'
    const match = name.match(/[^\w \(\)#%&+=.-]/g)
    if (match) return 'Name contains invalid characters: ' + match.join('')
    return null
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