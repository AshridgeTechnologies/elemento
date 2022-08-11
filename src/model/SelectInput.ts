import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'
import {propDef} from './BaseElement'
import DensitySmall from '@mui/icons-material/DensitySmall'

export type Properties = Readonly<{
    values?: PropertyValueType<string[]>,
    initialValue?: PropertyValueType<string>,
    label?: PropertyValueType<string>
}>

export default class SelectInput extends BaseInputElement<Properties> implements Element {

    static kind = 'SelectInput'
    static get iconClass() { return DensitySmall }
    get valueType(): PropertyType { return 'string list'}
    get values() { return this.properties.values }

    get propertyDefs() {
        return [
            ...super.propertyDefs,
            propDef('values', 'string list'),
        ]
    }

}