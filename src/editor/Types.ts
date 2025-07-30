import {ElementId, ElementType, InsertPosition} from '../model/Types'

export type AppElementActionName = 'copy' | 'cut' | 'pasteAfter' | 'pasteBefore' | 'pasteInside' | 'duplicate' | 'upload' | 'delete' | 'undo' | 'redo'

export class ConfirmAction {
    constructor(public readonly name: AppElementActionName) {}
    toString() { return this.name as string }
}

export type AppElementAction = ConfirmAction | 'insert' | AppElementActionName | 'show'
export type Action = {
    action: AppElementAction,
    ids: (string | number)[],
    itemNames: string[]
}

export type VoidFn = () => void
export type OnOpenFn = VoidFn
export type OnNewFn = VoidFn
export type OnOpenFromGitHubFn = VoidFn
export type OnGetFromGitHubFn = VoidFn
export type OnNameSelectedFn = (name: string) => void
export type OnSearchFn = (search: string) => void
export type OnChangeFn = (id: ElementId, propertyName: string, value: any) => void
export type OnInsertFnWithPositionFn = (insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType) => void
export type OnInsertWithSelectedFn = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => ElementId
export type OnMoveFn = (insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) => void
export type OnActionFn = (ids: ElementId[], action: AppElementAction) => Promise<ElementId | null | void>
export type InsertMenuItemsFn = (insertPosition: InsertPosition, targetItemId: ElementId) => ElementType[]
export type MenuItemFn = VoidFn

export type RunArea = 'opfs' | 'disk'

// As used in WebContainer
export interface FileSystemTree {
    [name: string]: DirectoryNode | FileNode
}
export interface DirectoryNode {
    directory: FileSystemTree
}
export interface FileNode {
    file: {
        contents: string | Uint8Array
    }
}

export type ActionsAvailableFn = (targetElementIds: ElementId[]) => AppElementAction[]

export type ProjectSettings = {[key: string]: object}
export type RunAppFn = (area: RunArea, projectName: string, appName: string, dirHandle: FileSystemDirectoryHandle) => void
