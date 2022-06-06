import {ComponentType, ElementId, ElementType, InsertPosition} from './Types'

export default interface Element {
    kind: ElementType
    id: ElementId
    name: string
    properties: object
    elements: ReadonlyArray<Element> | undefined
    type() : ComponentType
    findElement(id: ElementId) : Element | null
    findParent(id: ElementId) : Element | null
    findElementPath(id: ElementId) : string | null
    findElementByPath(path: string) : Element | null
    findMaxId(elementType: ElementType): number
    allElements(): Element[]
    set(id: ElementId, propertyName: string, value: any): Element
    delete(itemId: ElementId): Element

    doInsert(insertPosition: InsertPosition, selectedItemId: ElementId, elementType: ElementType, newIdSeq?: number): [Element, (Element | null)]
    canContain(elementType: ElementType): boolean

    get codeName(): string
}
