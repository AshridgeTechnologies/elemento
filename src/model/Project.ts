import {ElementId, ElementType, PropertyValue} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'

type Properties = { author?: PropertyValue }

export default class Project extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    kind = 'Project' as ElementType

    insert(selectedItemId: ElementId, elementType: ElementType): [Project, Element] {
        return this.doInsert(selectedItemId, elementType) as [Project, Element]
    }

    get pathSegment() {
        return ''
    }

    canContain(elementType: ElementType) {
        return elementType === 'App'
    }

}