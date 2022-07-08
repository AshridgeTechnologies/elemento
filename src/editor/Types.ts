import {ElementId, ElementType, InsertPosition} from '../model/Types'

export type AppElementAction = 'delete' | 'copy' | 'cut' | 'pasteAfter' | 'pasteBefore' | 'pasteInside' | 'duplicate'
export type OnOpenFn = () => void
export type OnSaveFn = () => void
export type OnPublishFn = (args: {name: string, code: string}) => void
export type OnChangeFn = (id: ElementId, propertyName: string, value: any) => void
export type OnInsertFn = (elementType: ElementType) => void
export type OnInsertWithSelectedFn = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => ElementId
export type OnMoveFn = (insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) => void
export type OnActionFn = (ids: ElementId[], action: AppElementAction) => void
export type MenuItemFn = () => void
