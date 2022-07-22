import {ComponentType, ElementId, PropertyValue} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'

type Properties = {
    readonly initialValue?: PropertyValue,
    readonly display?: PropertyValue,
}

export default class Data extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, 'Data', properties)
    }

    static is(element: Element): element is Data {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statefulUI' }
    get statePropertyNames(): string[] { return ['initialValue']}

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}
}