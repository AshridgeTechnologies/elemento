import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementId, PropertyValueType} from './Types'

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
        super(id, name, 'MemoryDataStore', properties)
    }

    static is(element: Element): element is MemoryDataStore {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'backgroundFixed' }

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}

}