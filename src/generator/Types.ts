import List from '../model/List'
import Element from '../model/Element'
import App from '../model/App'
import {flatten} from 'ramda'
import {ElementType} from '../model/Types'

export class ListItem {
    constructor(public list: List) {
    }

    get id() {
        return this.list.id
    }
}

export const allElements = (component: Element | ListItem): Element[] => {
    if (component instanceof App) {
        return flatten(component.otherComponents.map(el => [el, allElements(el)]))
    }
    if (component instanceof ListItem) {
        const childElements = component.list.elements || []
        return flatten(childElements.map(el => [el, allElements(el)]))
    }
    if (component instanceof List) {
        return []
    }

    const childElements = component.elements || []
    return flatten(childElements.map(el => [el, allElements(el)]))
}

const runtimeNames = {
    Text: 'TextElement',
    List: 'ListElement',
}
export const runtimeElementName = (element: Element) => runtimeElementTypeName(element.kind)
export const runtimeElementTypeName = (elementType: ElementType) => runtimeNames[elementType as keyof typeof runtimeNames] ?? elementType
export type ExprType = 'singleExpression' | 'action' | 'multilineExpression'