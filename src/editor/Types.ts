import {ElementId, ElementType} from '../model/Types'

export type OnOpenFn = () => void
export type OnSaveFn = () => void
export type OnChangeFn = (id: ElementId, propertyName: string, value: any) => void
export type OnInsertFn = (elementType: ElementType) => void
export type OnInsertWithSelectedFn = (selectedItemId: ElementId, elementType: ElementType) => ElementId