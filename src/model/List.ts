import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import {ComponentType, ElementType, eventAction, PropertyDef, PropertyExpr, PropertyValueType, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = Partial<Readonly<{
    items: PropertyValueType<any[]>,
    selectedItem: PropertyValueType<any>,
    selectable: PropertyValueType<boolean>,
    selectAction: PropertyExpr
}>> & Styling & Show

export default class List extends BaseElement<Properties> implements Element {

    readonly kind = 'List'
    get iconClass() { return 'list' }
    type(): ComponentType { return 'statefulUI' }
    isLayoutOnly() { return true }

    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            ...visualPropertyDefs(),
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
