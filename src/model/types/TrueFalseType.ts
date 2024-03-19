import Element from '../Element'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

type Properties = BaseTypeProperties & {
}

export default class TrueFalseType extends BaseTypeElement<Properties> implements Element {

    readonly kind = 'TrueFalseType'
    get iconClass() { return 'check_circle_outlined' }

}
