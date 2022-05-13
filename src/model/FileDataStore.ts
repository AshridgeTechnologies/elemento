import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementId, ElementType} from './Types'

type Properties = {
}

export default class FileDataStore extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, properties)
    }

    static is(element: Element): element is FileDataStore {
        return element.constructor.name === this.name
    }

    kind = 'FileDataStore' as ElementType
    componentType = 'statefulUI' as ComponentType

}