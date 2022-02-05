import Element from './Element'
import BaseElement from './BaseElement'
import {ElementId, PropertyValue} from './Types'

type Properties = {
    readonly content: PropertyValue,
    readonly style?: PropertyValue,
    readonly display?: PropertyValue,
}

export default class Text extends BaseElement<Properties> implements Element {
    constructor(
        id:  ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, properties)
    }

    static is(element: Element): element is Text {
        return element.constructor.name === this.name
    }

    get content() {return this.properties.content}
    get style() {return this.properties.style}
    get display() {return this.properties.display ?? true}
}
