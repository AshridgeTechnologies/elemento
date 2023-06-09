import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'
import {propDef} from './BaseElement'

export type Properties = BaseInputProperties<string> & {
    values?: PropertyValueType<string[]>
}

export default class SelectInput extends BaseInputElement<Properties> implements Element {

    static kind = 'SelectInput'
    static get iconClass() { return 'density_small' }
    get valueType(): PropertyType { return 'string list'}
    get values() { return this.properties.values }

    get propertyDefs() {
        return [
            ...super.propertyDefs,
            propDef('values', 'string list'),
        ]
    }

}