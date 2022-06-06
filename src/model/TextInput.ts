import Element from './Element'
import {ElementId, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'

export type Properties = {
    readonly initialValue?: PropertyValueType<string>,
    readonly maxLength?: PropertyValueType<number>,
    readonly multiline?: PropertyValueType<boolean>,
    readonly width?: PropertyValueType<string|number>,
    readonly label?: PropertyValueType<string>
}

export default class TextInput extends BaseInputElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties) {
        super(id, name, 'TextInput', properties)
    }

    static is(element: Element): element is TextInput {
        return element.constructor.name === this.name
    }

    get maxLength() { return this.properties.maxLength }
    get multiline() { return this.properties.multiline }
    get width() { return this.properties.width }
}
