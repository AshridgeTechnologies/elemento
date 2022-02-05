import Element from './Element'
import BaseElement from './BaseElement'
import {ElementId, ElementType, PropertyValue} from './Types'
import {createElement} from './createElement'

type Properties = { style?: PropertyValue }

export default class Page extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    static is(element: Element): element is Page {
        return element.constructor.name === this.name
    }

    get style() { return this.properties.style }

    insert(selectedItemId: ElementId, elementType: ElementType, newIdSeq: number): [Page, Element | null] {
        let insertIndex = -1
        if (selectedItemId === this.id) {
            insertIndex = 0
        }

        const selectedItemIndex = this.elementArray().findIndex( it => it.id === selectedItemId)
        if (selectedItemIndex >= 0) {
            insertIndex = selectedItemIndex + 1
        }

        if (insertIndex !== -1) {
            const newElements = [...this.elementArray()]
            const newElement = createElement(elementType, newIdSeq)
            newElements.splice(insertIndex, 0, newElement)
            return [this.create(this.id, this.name, this.properties, newElements), newElement]
        }
        return [this, null]
    }
}