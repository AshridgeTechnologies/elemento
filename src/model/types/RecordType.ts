import Element from '../Element'
import {ElementType} from '../Types'
import {elementOfType} from '../elements'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

type Properties = BaseTypeProperties & {
}

export default class RecordType extends BaseTypeElement<Properties> implements Element {

    static kind = 'RecordType'
    static get iconClass() { return 'wysiwyg_outlined' }


    canContain(elementType: ElementType) {
        const elementClass = elementOfType(elementType)
        return Boolean((elementClass as any).isDataType?.()) || super.canContain(elementType)
    }
}
