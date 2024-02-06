import {ComponentType, ElementType, PropertyDef, PropertyValueType, Show, Styling} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = Partial<Readonly<{
    label: PropertyValueType<string>,
    filled: PropertyValueType<boolean>
}>> & Styling & Show

export default class Menu extends BaseElement<Properties> implements Element {

    static kind = 'Menu'
    static get iconClass() { return 'menu' }
    type(): ComponentType { return 'statelessUI' }

    get label() {return this.properties.label ?? this.name}
    get filled() {return this.properties.filled}
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('label', 'string'),
            propDef('filled', 'boolean'),
            propDef('show', 'boolean'),
            propDef('styles', 'styles')
        ]
    }

    canContain(elementType: ElementType) {
        return ['MenuItem'].includes(elementType)
    }
}
