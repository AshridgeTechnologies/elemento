import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementId, ElementType, PropertyValue, PropertyValueType} from './Types'
import { createElement } from './createElement'

type Properties = { items: PropertyValueType<any[]>, style?: PropertyValueType<string>, width?: PropertyValueType<string | number> }

export default class List extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    static is(element: Element): element is List {
        return element.constructor.name === this.name
    }

    kind = 'List' as ElementType
    componentType = 'statefulUI' as ComponentType

    get style() { return this.properties.style }
    get items() { return this.properties.items }
    get width() { return this.properties.width }

    createElement(elementType: ElementType, newIdSeq: number): Element {
        return createElement(elementType, newIdSeq)
    }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'Page', 'MemoryDataStore'].includes(elementType)
    }

}