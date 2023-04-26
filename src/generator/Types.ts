import List from '../model/List'
import Element from '../model/Element'
import {ElementId, ElementType} from '../model/Types'

export class ListItem {
    constructor(public list: List) {
    }

    get id() {
        return this.list.id
    }
}

const runtimeNames = {
    Text: 'TextElement',
    List: 'ListElement',
}
export const runtimeElementName = (element: Element) => runtimeElementTypeName(element.kind)
export const runtimeElementTypeName = (elementType: ElementType) => runtimeNames[elementType as keyof typeof runtimeNames] ?? elementType
export type ExprType = 'singleExpression' | 'action' | 'multilineExpression'
export type ElementErrors = { [propertyName: string]: string }
export type AllErrors = { [elementId: ElementId]: ElementErrors }

export interface GeneratorOutput {
    files: { name: string; content: string }[]
    errors: AllErrors
    code: string
}