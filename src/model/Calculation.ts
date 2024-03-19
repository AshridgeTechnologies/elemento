import {ComponentType, PropertyDef, PropertyExpr, PropertyValueType, Styling} from './Types'
import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'

type Properties = Partial<Readonly<{
    calculation: PropertyExpr,
    label: PropertyValueType<string>,
    show: PropertyValueType<boolean>,
}>> & Styling

export default class Calculation extends BaseElement<Properties> implements Element {

    readonly kind = 'Calculation'
    get iconClass() { return 'calculate_outlined' }
    type(): ComponentType { return 'statefulUI' }

    get calculation() {return this.properties.calculation}
    get label() {return this.properties.label}
    get show() {return this.properties.show ?? true}
    get styles() {return this.properties.styles}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('calculation', 'expr', {state: true}),
            propDef('label', 'string'),
            ...visualPropertyDefs()
        ]
    }
}
