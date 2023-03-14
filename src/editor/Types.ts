import {ElementId, ElementType, InsertPosition} from '../model/Types'

export type AppElementActionName = 'copy' | 'cut' | 'pasteAfter' | 'pasteBefore' | 'pasteInside' | 'duplicate' | 'upload' | 'delete'

export class ConfirmAction {
    constructor(public readonly name: AppElementActionName) {}
    toString() { return this.name as string }
}

export class InsertAction {
    constructor(public readonly position: InsertPosition) {}
}

export type AppElementAction = ConfirmAction | InsertAction | AppElementActionName
type VoidFn = () => void
export type OnOpenFn = VoidFn
export type OnExportFn = VoidFn
export type OnNewFn = VoidFn
export type OnSaveToGitHubFn = VoidFn
export type OnGetFromGitHubFn = VoidFn
export type OnUpdateFromGitHubFn = VoidFn
export type OnChangeFn = (id: ElementId, propertyName: string, value: any) => void
export type OnInsertFn = (elementType: ElementType) => void
export type OnInsertWithSelectedFn = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => ElementId
export type OnMoveFn = (insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) => void
export type OnActionFn = (ids: ElementId[], action: AppElementAction) => Promise<ElementId | null | void>
export type MenuItemFn = VoidFn


// As used in WebContainer
export interface FileSystemTree {
    [name: string]: DirectoryNode | FileNode
}
export interface DirectoryNode {
    directory: FileSystemTree
}
export interface FileNode {
    file: {
        contents: string | Uint8Array;
    }
}