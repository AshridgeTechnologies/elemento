import Element from './Element'
import {PropertyType} from './Types'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'

export type Properties = BaseInputProperties<Date> & {
}

export default class DateInput extends BaseInputElement<Properties> implements Element {

    readonly kind = 'DateInput'
    get iconClass() { return 'insert_invitation_outlined' }
    get valueType(): PropertyType { return 'date' }
}
