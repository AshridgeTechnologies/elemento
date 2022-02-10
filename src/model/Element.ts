import {ElementId, ElementType} from './Types'

export default interface Element {
    kind: ElementType
    id: ElementId
    name: string
    properties: object
    elements: ReadonlyArray<Element> | undefined
    findElement(id: ElementId) : Element | null
    findMaxId(elementType: ElementType): number
    set(id: ElementId, propertyName: string, value: any): Element
    delete(itemId: ElementId): Element

    get codeName(): string
}
