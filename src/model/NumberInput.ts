import Element from './Element'
import {ElementId, ElementType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'

export type Properties = {
    readonly initialValue?: PropertyValueType<number>,
    readonly label?: PropertyValueType<string>
}
export default class NumberInput extends BaseInputElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties) {
        super(id, name, properties)
    }

    static is(element: Element): element is NumberInput {
        return element.constructor.name === this.name
    }

    kind = 'NumberInput' as ElementType
}