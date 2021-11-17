import {ElementType} from './Types'

export default interface Element {
    kind: ElementType
    id: string
    name: string
    properties: object
    elements: ReadonlyArray<Element> | undefined
    findElement(id: string) : Element | null
    set(id: string, propertyName: string, value: any): Element
}
