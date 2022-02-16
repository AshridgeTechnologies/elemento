import BaseElement from './BaseElement'
import Element from './Element'
import {ElementId, PropertyExpr, PropertyValue} from './Types'

export type Properties = {
    readonly values: string[] | PropertyExpr,
    readonly initialValue?: PropertyValue,
    readonly label?: PropertyValue
}
export default class SelectInput extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties) {
        super(id, name, properties)
    }

    static is(element: Element): element is SelectInput {
        return element.constructor.name === this.name
    }

    get values() { return this.properties.values }
    get initialValue() { return this.properties.initialValue }
    get label() { return this.properties.label }
}