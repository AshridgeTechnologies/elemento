import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'

export type Properties = {
    readonly initialValue?: PropertyValueType<boolean>,
    readonly label?: PropertyValueType<string>
}
export default class TrueFalseInput extends BaseInputElement<Properties> implements Element {

    static kind = 'TrueFalseInput'
    static get iconClass() { return 'toggle_on' }
    get valueType(): PropertyType { return 'boolean' }
}