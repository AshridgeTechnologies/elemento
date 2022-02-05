import BaseElement from './BaseElement'
import Element from './Element'
import {ElementId, PropertyValue} from './Types'

export type Properties = {
    readonly initialValue?: PropertyValue,
    readonly maxLength?: PropertyValue,
    readonly label?: PropertyValue
}
export default class TextInput extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties) {
        super(id, name, properties)
    }

    static is(element: Element): element is TextInput {
        return element.constructor.name === this.name
    }

    get initialValue() { return this.properties.initialValue }
    get maxLength() { return this.properties.maxLength }
    get label() { return this.properties.label }
}