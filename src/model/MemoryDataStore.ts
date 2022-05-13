import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementId, ElementType, PropertyValueType} from './Types'

type Properties = {
    readonly initialValue?: PropertyValueType<any>,
    readonly display?: PropertyValueType<boolean>,
}

export default class MemoryDataStore extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, properties)
    }

    static is(element: Element): element is MemoryDataStore {
        return element.constructor.name === this.name
    }

    kind = 'MemoryDataStore' as ElementType
    componentType = 'backgroundFixed' as ComponentType

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}

}