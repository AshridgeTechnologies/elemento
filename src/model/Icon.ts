import {ComponentType, eventAction, PropertyDef, PropertyExpr, PropertyValueType, Show, Styling} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = Partial<Readonly<{
    iconName: PropertyValueType<string>,
    label: PropertyValueType<string>,
    action: PropertyExpr,
}>> & Styling & Show

export default class Icon extends BaseElement<Properties> implements Element {

    static kind = 'Icon'
    static get iconClass() { return 'sentiment_satisfied' }
    static get initialProperties() { return {iconName: 'sentiment_satisfied'} }
    type(): ComponentType { return 'statelessUI' }

    get iconName() {return this.properties.iconName}
    get label() {return this.properties.label}
    get action() {return this.properties.action}
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('iconName', 'string'),
            propDef('label', 'string'),
            propDef('action', eventAction()),
            propDef('show', 'boolean'),
            propDef('styles', 'styles')
        ]
    }
}
