import {ElementId, ElementType, InsertPosition} from '../model/Types'

export type AppElementAction = 'delete' | 'copy' | 'cut' | 'pasteAfter' | 'pasteBefore' | 'pasteInside' | 'duplicate'
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
export type OnActionFn = (ids: ElementId[], action: AppElementAction) => void
export type MenuItemFn = VoidFn
