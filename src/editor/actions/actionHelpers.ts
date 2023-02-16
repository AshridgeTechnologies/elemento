import React, {ChangeEvent, useState} from 'react'
import {AlertColor} from '@mui/material'
import EditorManager from './EditorManager'

export type ShowAlertFn = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => void

export type Optional<T> = {
    [Property in keyof T]+?: T[Property];
}

type OpenProjectMessage  = { type: 'openProject', projectName: string, url: string }
type UpdateProjectMessage  = { type: 'updateProject', projectName: string }
type OperationCancelledMessage  = { type: 'operationCancelled' }
export type PopupMessage = OpenProjectMessage | UpdateProjectMessage | OperationCancelledMessage

export function validateProjectName(name: string, existingNames: string[]) {
    if (existingNames.includes(name)) return 'There is already a project with this name'
    const match = name.match(/[^\w \(\)#%&+=.-]/g)
    if (match) return 'Name contains invalid characters: ' + match.join('')
    return null
}

export const onChangeValue = (onChangeFn: (val: string) => void) => (event: ChangeEvent) => onChangeFn((event.target as HTMLInputElement).value)

export class UIManager {
    constructor(private props: {onClose: () => void, showAlert: ShowAlertFn, editorId: string}) {
    }

    get onClose() { return this.props.onClose }
    get showAlert() { return this.props.showAlert }

    sendMessageToEditor(message: PopupMessage) {
        window.localStorage.setItem('msg_' + this.props.editorId, JSON.stringify(message))
    }

    doAction(description: string, actionFn: () => void) {
        return async () => {
            try {
                await actionFn()
                this.showAlert(description, 'Project downloaded', null, 'success')
            } catch (e: any) {
                console.error('Error in ' + description, e)
                this.showAlert(description, `Error: ${e.message}`, null, 'error')
            }
            this.onClose()
        }
    }

    onCancel(description: string) {
        return () => {
            this.showAlert(description, 'Operation cancelled', null, 'info')
            this.sendMessageToEditor({type:'operationCancelled'})
            this.onClose()
        }
    }
}

type StateClass<T> = { new(props: { editorManager: EditorManager, uiManager: UIManager }, onUpdate: (t: T) => void): T }

export function useDialogState<T>(stateClass: StateClass<T>, editorManager: EditorManager, uiManager: UIManager) {
    const onUpdate = (newState: T) => setState(newState)
    const [state, setState] = useState(() => new stateClass({editorManager, uiManager}, onUpdate))
    return state
}

