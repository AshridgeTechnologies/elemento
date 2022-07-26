import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementId, ElementType, PropertyDef} from './Types'

type Properties = {}

export default class Page extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, 'Page', properties, elements)
    }

    static is(element: Element): element is Page {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statefulUI' }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore', 'FileDataStore', 'MenuItem'].includes(elementType)
    }

    get propertyDefs(): PropertyDef[] { return [] }

}