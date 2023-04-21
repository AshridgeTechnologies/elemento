import Element from '../Element'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

type Properties = BaseTypeProperties & {
}

export default class TrueFalseType extends BaseTypeElement<Properties> implements Element {

    static kind = 'TrueFalseType'
    static get iconClass() { return 'check_circle_outlined' }

}
