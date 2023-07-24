import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'

type Properties = {}

export default class ToolFolder extends BaseElement<Properties> implements Element {
    static kind = 'ToolFolder'
    static get iconClass() { return 'home_repair_service_outlined' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    type(): ComponentType {
        return 'background'
    }

    canContain(elementType: ElementType): boolean {
        return ['Tool'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }
}