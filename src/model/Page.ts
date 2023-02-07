import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementType, PropertyDef} from './Types'
import {elementOfType} from './elements'

type Properties = {}

export default class Page extends BaseElement<Properties> implements Element {

    static kind = 'Page'
    static get iconClass() { return 'web' }
    type(): ComponentType { return 'statefulUI' }

    canContain(elementType: ElementType) {
        const parentType = elementOfType(elementType).parentType
        return parentType === this.kind || parentType === 'any'
    }

    static get parentType(): ElementType | 'any' | null { return 'App' }

    get propertyDefs(): PropertyDef[] { return [] }

}