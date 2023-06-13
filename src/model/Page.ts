import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = {}

export default class Page extends BaseElement<Properties> implements Element {

    static kind = 'Page'
    static get iconClass() { return 'web' }
    type(): ComponentType { return 'statefulUI' }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    static get parentType(): ParentType { return 'App' }

    get propertyDefs(): PropertyDef[] { return [] }

}