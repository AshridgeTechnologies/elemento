import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import {elementOfType} from './elements'

type Properties = { title?: PropertyValueType<string> }

export default class AppBar extends BaseElement<Properties> implements Element {

    static kind = 'AppBar'
    static get iconClass() { return 'web_asset' }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get title() { return this.properties.title }

    canContain(elementType: ElementType) {
        const parentType = elementOfType(elementType).parentType
        return parentType === this.kind || parentType === 'any'
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('title')
        ]
    }

    static get parentType(): ElementType | 'any' | null { return 'App' }

}