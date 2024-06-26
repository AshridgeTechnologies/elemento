import Element from '../model/Element'
import {ElementId, ElementType} from '../model/Types'
import ItemSet from '../model/ItemSet'

export class ListItem {
    constructor(public itemSet: ItemSet) {
    }

    kind = 'ListItem'

    get id() {
        return this.itemSet.id
    }

    elementArray() { return this.itemSet.elementArray() }
}

const runtimeNames = {
    Text: 'TextElement',
    List: 'ListElement',
    Component: 'ComponentElement',
}
export const runtimeElementName = (element: Element) => runtimeElementTypeName(element.kind)
export const runtimeElementTypeName = (elementType: ElementType) => runtimeNames[elementType as keyof typeof runtimeNames] ?? elementType
export type ExprType = 'singleExpression' | 'action' | 'multilineExpression' | 'reference'
export type ElementErrors = { [propertyName: string]: string | ElementErrors }
export type AllErrors = { [elementId: ElementId]: ElementErrors }

export interface GeneratorOutput {
    files: { name: string; contents: string }[]
    errors: AllErrors
    code: string
    html: string
}

export const runtimeImportPath = 'https://elemento.online/lib'
export type IdentifierCollector = { add(s: string): void }
