import {ComponentType, ElementId, PropertyExpr} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'

type Properties = {
    readonly input1?: string,
    readonly input2?: string,
    readonly input3?: string,
    readonly input4?: string,
    readonly input5?: string,
    readonly calculation?: PropertyExpr,
}

export default class FunctionDef extends BaseElement<Properties> implements Element {
    constructor(
        id:  ElementId,
        name: string,
        properties: Properties
) {
        super(id, name, 'Function', properties)
    }

    static is(element: Element): element is FunctionDef {
        return element.constructor.name === this.name
    }

    type(): ComponentType {
        return 'background';
    }

    get input1() { return this.properties.input1}
    get input2() { return this.properties.input2}
    get input3() { return this.properties.input3}
    get input4() { return this.properties.input4}
    get input5() { return this.properties.input5}
    get calculation() { return this.properties.calculation}
}