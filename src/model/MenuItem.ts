import {ComponentType, eventAction, ParentType, PropertyDef, PropertyExpr, PropertyValueType, Show, Styling} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = Partial<Readonly<{
    label: PropertyValueType<string>,
    action: PropertyExpr,
}>> & Styling & Show

export default class MenuItem extends BaseElement<Properties> implements Element {

    static kind = 'MenuItem'
    static get iconClass() { return 'menu_open' }
    type(): ComponentType { return 'statelessUI' }

    get label() {return this.properties.label ?? this.name}
    get action() {return this.properties.action}
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('label', 'string'),
            propDef('action', eventAction()),
            propDef('show', 'boolean'),
            propDef('styles', 'styles')
        ]
    }

    static get parentType(): ParentType { return 'Menu' }
}
