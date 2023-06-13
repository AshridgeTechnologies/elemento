import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'

type Properties = {}

export default class FileFolder extends BaseElement<Properties> implements Element {
    static kind = 'FileFolder'
    static get iconClass() { return 'folder' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    type(): ComponentType {
        return 'background'
    }

    canContain(elementType: ElementType): boolean {
        return ['File'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }


}