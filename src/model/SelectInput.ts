import Element from './Element'
import {ElementId, ElementType, PropertyValueType} from './Types'
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
        super(id, name, properties)
    }

    static is(element: Element): element is SelectInput {
        return element.constructor.name === this.name
    }

    kind = 'SelectInput' as ElementType

    get values() { return this.properties.values }
}