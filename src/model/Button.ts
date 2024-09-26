import {ComponentType, eventAction, PropertyDef, PropertyExpr, PropertyValueType, Styling} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

const appearanceChoices = ['outline', 'filled', 'link'] as const
type Appearance = typeof appearanceChoices[number]
type Properties = Partial<Readonly<{
    content: PropertyValueType<string>,
    iconName: PropertyValueType<string>,
    action: PropertyExpr,
    appearance: PropertyValueType<Appearance>,
    enabled: PropertyValueType<boolean>,
    show: PropertyValueType<boolean>,
}>> & Styling

export default class Button extends BaseElement<Properties> implements Element {

    readonly kind = 'Button'
    get iconClass() { return 'crop_3_2' }
    type(): ComponentType { return 'statelessUI' }

    get content() {return this.properties.content ?? this.name}
    get iconName() {return this.properties.iconName}
    get appearance() {return this.properties.appearance ?? appearanceChoices[0]}
    get show() {return this.properties.show}
    get enabled() {return this.properties.enabled}
    get action() {return this.properties.action}
    get styles() {return this.properties.styles}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('content', 'string'),
            propDef('iconName', 'string'),
            propDef('appearance', appearanceChoices),
            propDef('show', 'boolean'),
            propDef('enabled', 'boolean'),
            propDef('action', eventAction()),
            propDef('styles', 'styles'),
        ]
    }
}
