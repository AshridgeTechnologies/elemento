import {ElementId, PropertyValue} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'

type Properties = {
    readonly content: PropertyValue,
    readonly action?: PropertyValue,
    readonly style?: PropertyValue,
    readonly display?: PropertyValue,
}

export default class Button extends BaseElement<Properties> implements Element {
    constructor(
        id:  ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, properties)
    }

    static is(element: Element): element is Button {
        return element.constructor.name === this.name
    }

    get content() {return this.properties.content}
    get action() {return this.properties.action}
    get style() {return this.properties.style}
    get display() {return this.properties.display ?? true}
}