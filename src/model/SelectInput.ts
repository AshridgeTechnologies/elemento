import Element from './Element'
import {ElementId, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'

export type Properties = {
    readonly values: PropertyValueType<string[]>,
    readonly initialValue?: PropertyValueType<string>,
    readonly label?: PropertyValueType<string>
}
export default class SelectInput extends BaseInputElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties) {
        super(id, name, 'SelectInput', properties)
    }

    static is(element: Element): element is SelectInput {
        return element.constructor.name === this.name
    }

    get values() { return this.properties.values }
}