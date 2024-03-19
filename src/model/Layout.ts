import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValueType, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = Partial<Readonly<{
    horizontal: PropertyValueType<boolean>,
    wrap: PropertyValueType<boolean>
}>> & Styling & Show

export default class Layout extends BaseElement<Properties> implements Element {

    readonly kind = 'Layout'
    get iconClass() { return 'view_module' }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get horizontal() { return this.properties.horizontal ?? false }
    get wrap() { return this.properties.wrap ?? false }
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('horizontal', 'boolean'),
            propDef('wrap', 'boolean'),
            ...visualPropertyDefs(),
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
