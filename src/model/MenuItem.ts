import {
    ComponentType,
    ElementType,
    eventAction,
    ParentType,
    PropertyDef,
    PropertyExpr,
    PropertyValueType
} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly label?: PropertyValueType<string>,
    readonly action?: PropertyExpr,
    readonly display?: PropertyValueType<boolean>,
}

export default class MenuItem extends BaseElement<Properties> implements Element {

    static kind = 'MenuItem'
    static get iconClass() { return 'menu_open' }
    type(): ComponentType { return 'statelessUI' }

    get label() {return this.properties.label ?? this.name}
    get display() {return this.properties.display}
    get action() {return this.properties.action}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('label', 'string'),
            propDef('display', 'boolean'),
            propDef('action', eventAction())
        ]
    }

    static get parentType():
        ParentType { return 'Menu' }

}