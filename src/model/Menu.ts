import {ComponentType, ElementType, PropertyDef, PropertyValueType, Show, Styling, StylingProps} from './Types'
import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'

type Properties = Partial<Readonly<{
    label: PropertyValueType<string>,
    iconName: PropertyValueType<string>,
    filled: PropertyValueType<boolean>,
    buttonStyles?: StylingProps
}>> & Styling & Show

export default class Menu extends BaseElement<Properties> implements Element {

    readonly kind = 'Menu'
    get iconClass() { return 'menu' }
    type(): ComponentType { return 'statelessUI' }

    get label() {return this.properties.label ?? this.name}
    get iconName() {return this.properties.iconName}
    get filled() {return this.properties.filled}
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }
    get buttonStyles() { return this.properties.buttonStyles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('label', 'string'),
            propDef('iconName', 'string'),
            propDef('filled', 'boolean'),
            ...visualPropertyDefs(),
            propDef('buttonStyles', 'styles')

        ]
    }

    canContain(elementType: ElementType) {
        return ['MenuItem'].includes(elementType)
    }
}
