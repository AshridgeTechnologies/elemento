import {ComponentType, ParentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly target?: PropertyExpr,
}

export default class Adapter extends BaseElement<Properties> implements Element {

    readonly kind = 'Adapter'
    static get parentType() { return 'App' as ParentType }
    get iconClass() { return 'settings_ethernet' }
    type(): ComponentType { return 'background' }

    get target() {return this.properties.target}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('target', 'expr', {state: true}),
        ]
    }

}

