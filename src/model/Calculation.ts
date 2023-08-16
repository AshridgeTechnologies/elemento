import {ComponentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = Partial<Readonly<{
    calculation: PropertyExpr,
    label: PropertyValueType<string>,
    display: PropertyValueType<boolean>,
    width: PropertyValueType<number | string>,
}>>

export default class Calculation extends BaseElement<Properties> implements Element {

    static kind = 'Calculation'
    static get iconClass() { return 'calculate_outlined' }
    type(): ComponentType { return 'statefulUI' }

    get calculation() {return this.properties.calculation}
    get label() {return this.properties.label}
    get display() {return this.properties.display ?? true}
    get width() {return this.properties.width}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('calculation', 'expr', {state: true}),
            propDef('label', 'string'),
            propDef('display', 'boolean'),
            propDef('width', 'string|number'),
        ]
    }
}