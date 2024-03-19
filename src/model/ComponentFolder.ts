import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'

type Properties = {}

export default class ComponentFolder extends BaseElement<Properties> implements Element {
    readonly kind = 'ComponentFolder'
    get iconClass() { return 'folder' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    type(): ComponentType {
        return 'background'
    }

    canContain(elementType: ElementType): boolean {
        return (['Component']).includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }
}
