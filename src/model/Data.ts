import {ComponentType, ElementId, ElementType, PropertyValue} from './Types'
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
        super(id, name, properties)
    }

    static is(element: Element): element is Data {
        return element.constructor.name === this.name
    }

    kind = 'Data' as ElementType
    componentType = 'statefulUI' as ComponentType

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}
}