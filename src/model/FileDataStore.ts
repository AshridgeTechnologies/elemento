import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementId} from './Types'

type Properties = {
}

export default class FileDataStore extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, 'FileDataStore', properties)
    }

    static is(element: Element): element is FileDataStore {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statefulUI' }

}