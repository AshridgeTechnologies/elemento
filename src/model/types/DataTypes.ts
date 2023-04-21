import Element from '../Element'
import BaseElement from '../BaseElement'
import {ComponentType, ElementId, ElementType, ParentType, PropertyDef} from '../Types'
import {elementOfType} from '../elements'

type Properties = { }

export default class DataTypes extends BaseElement<Properties> implements Element {

    static kind = 'DataTypes'
    static get iconClass() { return 'view_module' }

    static get parentType(): ParentType { return null }

    type(): ComponentType { return 'utility' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    canContain(elementType: ElementType) {
        const elementClass = elementOfType(elementType)
        return Boolean((elementClass as any).isDataType?.())
    }

}