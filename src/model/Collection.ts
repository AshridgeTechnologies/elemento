import {ElementId, ElementType, PropertyValue} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'

type Properties = {
    readonly initialValue?: PropertyValue,
    readonly display?: PropertyValue,
}

export default class Collection extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, properties)
    }

    static is(element: Element): element is Collection {
        return element.constructor.name === this.name
    }

    kind = 'Collection' as ElementType

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}
}