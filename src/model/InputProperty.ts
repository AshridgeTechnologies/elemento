import {ComponentType, eventAction, ParentType, PropertyDef, PropertyExpr, PropertyType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type InputPropertyType = 'string' | 'string|number' | 'string list' | 'string multiline' | 'number' | 'boolean' | 'date' | 'expr' | 'action'
type Properties = Partial<Readonly<{
    propertyType: InputPropertyType
}>>

export default class InputProperty extends BaseElement<Properties> implements Element {

    readonly kind = 'InputProperty'
    get iconClass() { return 'login' }
    type(): ComponentType { return 'utility' }

    get propertyType() {
        const propType = this.properties.propertyType
        return propType === 'action' ? eventAction() : propType
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('propertyType', [
                // fixed values
                'string', 'string|number', 'string list', 'string multiline', 'number', 'boolean', 'date', 'expr',
                // special treatment
                'action']),
                // not included for now
                // 'object', 'styles','choice list',
        ]
    }

    static get parentType(): ParentType { return 'Component' }
}
