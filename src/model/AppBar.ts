import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyValueType, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = { readonly title?: PropertyValueType<string> } & Styling & Show

export default class AppBar extends BaseElement<Properties> implements Element {

    readonly kind = 'AppBar'
    get iconClass() { return 'web_asset' }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get title() { return this.properties.title }
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('title'),
            ...visualPropertyDefs()
        ]
    }

    static get parentType(): ParentType { return 'App' }

}
