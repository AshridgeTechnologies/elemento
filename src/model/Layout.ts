import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import {elementOfType} from './elements'
import {elementHasParentTypeOf} from './createElement'

type Properties = { horizontal?: PropertyValueType<boolean>, width?: PropertyValueType<number | string>,
    backgroundColor?: PropertyValueType<string>, wrap?: PropertyValueType<boolean> }

export default class Layout extends BaseElement<Properties> implements Element {

    static kind = 'Layout'
    static get iconClass() { return 'view_module' }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get horizontal() { return this.properties.horizontal ?? false }
    get width() { return this.properties.width }
    get backgroundColor() { return this.properties.backgroundColor }
    get wrap() { return this.properties.wrap ?? false }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('horizontal', 'boolean'),
            propDef('width', 'string|number'),
            propDef('wrap', 'boolean'),
            propDef('backgroundColor', 'string'),
        ]
    }


    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

}