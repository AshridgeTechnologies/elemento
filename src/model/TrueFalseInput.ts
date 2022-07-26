import Element from './Element'
import {ElementId, PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'
import {propDef} from './BaseElement'

export type Properties = {
    readonly initialValue?: PropertyValueType<boolean>,
    readonly label?: PropertyValueType<string>
}
export default class TrueFalseInput extends BaseInputElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties) {
        super(id, name, 'TrueFalseInput', properties)
    }


    static is(element: Element): element is TrueFalseInput {
        return element.constructor.name === this.name
    }
    get valueType(): PropertyType { return 'boolean' }
}