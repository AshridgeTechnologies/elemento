import {ComponentType, eventAction, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

const appearanceChoices = ['outline', 'filled', 'link'] as const
type Appearance = typeof appearanceChoices[number]
type Properties = Partial<Readonly<{
    content: PropertyValueType<string>,
    action: PropertyExpr,
    appearance: PropertyValueType<Appearance>,
    enabled: PropertyValueType<boolean>,
    display: PropertyValueType<boolean>,
}>>

export default class Button extends BaseElement<Properties> implements Element {

    static kind = 'Button'
    static get iconClass() { return 'crop_3_2' }
    static get initialProperties() { return {content: 'Do something', appearance: appearanceChoices[0]} }
    type(): ComponentType { return 'statelessUI' }

    get content() {return this.properties.content ?? this.name}
    get appearance() {return this.properties.appearance ?? appearanceChoices[0]}
    get display() {return this.properties.display}
    get enabled() {return this.properties.enabled}
    get action() {return this.properties.action}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('content', 'string'),
            propDef('appearance', appearanceChoices),
            propDef('display', 'boolean'),
            propDef('enabled', 'boolean'),
            propDef('action', eventAction()),
        ]
    }
}