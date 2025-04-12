import {editorDialogClassName} from '../shared/controllerHelpers'

export const editorElement = () => document.getElementById('editorMain')
export const editorDialogContainer = () => document.querySelector('.' + editorDialogClassName) as HTMLElement
