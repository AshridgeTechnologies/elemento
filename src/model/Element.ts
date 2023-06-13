import {ActionDef, ComponentType, ElementId, ElementType, InsertPosition, PropertyDef} from './Types'

export default interface Element {
    kind: ElementType
    id: ElementId
    name: string
    properties: object
    elements: ReadonlyArray<Element> | undefined
    type() : ComponentType
    get propertyDefs() : PropertyDef[]
    get actionDefs() : ActionDef[]

    getPropertyDef(propertyName: string): PropertyDef
    findElement(id: ElementId) : Element | null
    findParent(id: ElementId) : Element | null
    findElementPath(id: ElementId) : string | null
    findElementByPath(path: string) : Element | null
    findElementsBy(selectorFn: (el: Element) => boolean) : Element[]
    findMaxId(elementType: ElementType): number
    set(id: ElementId, propertyName: string, value: any): Element
    delete(itemId: ElementId): Element

    doInsert(insertPosition: InsertPosition, targetItemId: ElementId, element: Element | Element[]): Element
    doMove(insertPosition: InsertPosition, targetItemId: ElementId, movedElements: Element[]): Element

    canContain(elementType: ElementType): boolean

    get codeName(): string
}
