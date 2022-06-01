import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementId, ElementType, PropertyValueType} from './Types'
import {createElement} from './createElement'

type Properties = { title?: PropertyValueType<string> }

export default class AppBar extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    static is(element: Element): element is AppBar {
        return element.constructor.name === this.name
    }

    kind = 'AppBar' as ElementType
    componentType = 'statelessUI' as ComponentType

    isLayoutOnly() { return true }

    get title() { return this.properties.title }

    createElement(elementType: ElementType, newIdSeq: number): Element {
        return createElement(elementType, newIdSeq)
    }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore', 'FileDataStore'].includes(elementType)
    }

}