import {ComponentType, ParentType, PropertyDef, PropertyExpr} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = Partial<Readonly<{
    calculation: PropertyExpr,
}>>

export default class OutputProperty extends BaseElement<Properties> implements Element {

    readonly kind = 'OutputProperty'
    get iconClass() { return 'logout' }
    type(): ComponentType { return 'utility' }

    get calculation() {return this.properties.calculation}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('calculation', 'expr'),
        ]
    }

    static get parentType(): ParentType { return 'Component' }

}
