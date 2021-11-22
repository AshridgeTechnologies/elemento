import {ElementType, ElementId} from '../model/Types'

export type OnChangeFn = (id: ElementId, propertyName: string, value: any) => void
export type OnInsertFn = (elementType: ElementType) => void
export type OnInsertWithSelectedFn = (selectedItemId: ElementId, elementType: ElementType) => ElementId