import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementId, ElementType, PropertyValue} from './Types'
import {createElement} from './createElement'

type Properties = { style?: PropertyValue }

export default class Page extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, 'Page', properties, elements)
    }

    static is(element: Element): element is Page {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statefulUI' }

    get style() { return this.properties.style }

    createElement(elementType: ElementType, newIdSeq: number): Element {
        return createElement(elementType, newIdSeq)
    }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore', 'FileDataStore'].includes(elementType)
    }

}