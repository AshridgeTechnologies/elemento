import Element from './Element'
import {PropertyType} from './Types'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'

export type Properties = BaseInputProperties<boolean>
export default class TrueFalseInput extends BaseInputElement<Properties> implements Element {

    static kind = 'TrueFalseInput'
    static get iconClass() { return 'check_box_outlined' }
    get valueType(): PropertyType { return 'boolean' }
}
