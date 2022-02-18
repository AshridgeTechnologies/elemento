import Element from './Element'
import BaseElement from './BaseElement'
import {ElementId, ElementType, PropertyValue} from './Types'
import { createElement } from './createElement'

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

    createElement(elementType: ElementType, newIdSeq: number): Element {
        return createElement(elementType, newIdSeq)
    }

    canContain(elementType: ElementType) {
        return elementType !== 'Page' && elementType !== 'App'
    }

}