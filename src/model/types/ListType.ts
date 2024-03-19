import Element from '../Element'
import {ElementType} from '../Types'
import {elementOfType} from '../elements'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

type Properties = BaseTypeProperties & {
}

export default class ListType extends BaseTypeElement<Properties> implements Element {

    readonly kind = 'ListType'
    get iconClass() { return 'list_outlined' }

    get elementType() {
        const dataTypeElements = this.elementArray().filter( el => (el.constructor as any).isDataType?.())
        return dataTypeElements[0]
    }
    canContain(elementType: ElementType) {
        if (elementType === 'Rule') return true
        if (this.elementType) return false
        const elementClass = elementOfType(elementType)
        return Boolean((elementClass as any).isDataType?.()) || super.canContain(elementType)
    }
}
