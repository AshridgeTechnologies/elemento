import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import {elementOfType} from './elements'
import {elementHasParentTypeOf} from './createElement'

type Properties = { title?: PropertyValueType<string> }

export default class AppBar extends BaseElement<Properties> implements Element {

    static kind = 'AppBar'
    static get iconClass() { return 'web_asset' }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get title() { return this.properties.title }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('title')
        ]
    }

    static get parentType(): ElementType | 'any' | null { return 'App' }

}