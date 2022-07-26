import Element from './Element'
import {ElementId, PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'
import {propDef} from './BaseElement'

export type Properties = Readonly<{
    values: PropertyValueType<string[]>,
    initialValue?: PropertyValueType<string>,
    label?: PropertyValueType<string>
}>

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

    get valueType(): PropertyType { return 'string list'}
    get values() { return this.properties.values }

    get propertyDefs() {
        return [
            ...super.propertyDefs,
            propDef('values', 'string list'),
        ]
    }

}