import {ComponentType, ElementType, PropertyDef, PropertyExpr} from './Types'
import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import FunctionsIcon from '@mui/icons-material/Functions';

type Properties = {
    readonly input1?: string,
    readonly input2?: string,
    readonly input3?: string,
    readonly input4?: string,
    readonly input5?: string,
    readonly action?: boolean,
    readonly calculation?: PropertyExpr,
    readonly private?: boolean
}

export default class FunctionDef extends BaseElement<Properties> implements Element {

    static get iconClass() { return FunctionsIcon }
    kind: ElementType = 'Function'
    type(): ComponentType { return 'background' }

    get input1() { return this.properties.input1}
    get input2() { return this.properties.input2}
    get input3() { return this.properties.input3}
    get input4() { return this.properties.input4}
    get input5() { return this.properties.input5}
    get inputs() { return [this.input1, this.input2, this.input3, this.input4, this.input5].filter( p => !!p) as string[]}
    get action() { return this.properties.action}
    get calculation() { return this.properties.calculation}
    get private() { return this.properties.private}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('input1', 'string', {fixedOnly: true}),
            propDef('input2', 'string', {fixedOnly: true}),
            propDef('input3', 'string', {fixedOnly: true}),
            propDef('input4', 'string', {fixedOnly: true}),
            propDef('input5', 'string', {fixedOnly: true}),
            propDef('action', 'boolean', {fixedOnly: true}),
            propDef('calculation', 'expr', {state: true, multilineExpr: true}),
            propDef('private', 'boolean', {fixedOnly: true}),
        ]
    }

}