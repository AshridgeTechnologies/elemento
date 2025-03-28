import {CombinedPropertyValue, ComponentType, ElementId, ElementType, InsertPosition, PropertyDef} from './Types'

export default interface Element {
    kind: ElementType
    iconClass: string
    id: ElementId
    name: string
    notes: string | undefined
    properties: object
    elements: ReadonlyArray<Element> | undefined
    type() : ComponentType
    get propertyDefs() : PropertyDef[]
    get stateProperties() : string[]

    propertyValue(name: string): CombinedPropertyValue
    findElement(id: ElementId) : Element | null
    findParent(id: ElementId) : Element | null
    findElementPath(id: ElementId) : string | null
    findElementByPath(path: string) : Element | null
    findElementsBy(selectorFn: (el: Element) => boolean) : Element[]
    searchElements(search: RegExp): Element[]
    findMaxId(elementType: ElementType): number
    set(id: ElementId, propertyName: string, value: any): Element
    delete(itemId: ElementId): Element

    doInsert(insertPosition: InsertPosition, targetItemId: ElementId, element: Element | Element[]): Element
    doMove(insertPosition: InsertPosition, targetItemId: ElementId, movedElements: Element[]): Element

    canContain(elementType: ElementType): boolean

    get codeName(): string
}
