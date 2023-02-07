import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'

export type Properties = {
    readonly initialValue?: PropertyValueType<number>,
    readonly label?: PropertyValueType<string>
}
export default class NumberInput extends BaseInputElement<Properties> implements Element {

    static kind = 'NumberInput'
    static get iconClass() { return 'money_outlined' }
    get valueType(): PropertyType { return 'number' }
}