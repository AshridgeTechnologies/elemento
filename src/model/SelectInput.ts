import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'
import {propDef} from './BaseElement'

export type Properties = BaseInputProperties<string> & Partial<Readonly<{
    values: PropertyValueType<string[]>
}>>

export default class SelectInput extends BaseInputElement<Properties> implements Element {

    readonly kind = 'SelectInput'
    get iconClass() { return 'density_small' }
    get valueType(): PropertyType { return 'string list'}
    get values() { return this.properties.values }

    protected ownPropertyDefs() {
        return [
            propDef('values', 'string list'),
        ]
    }
}
