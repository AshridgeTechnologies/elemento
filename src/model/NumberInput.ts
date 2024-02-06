import Element from './Element'
import {PropertyType} from './Types'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'

export type Properties = BaseInputProperties<number>

export default class NumberInput extends BaseInputElement<Properties> implements Element {

    static kind = 'NumberInput'
    static get iconClass() { return 'money_outlined' }
    get valueType(): PropertyType { return 'number' }
}
