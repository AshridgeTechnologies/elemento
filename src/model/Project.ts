import {ComponentType, ElementId, ElementType, InsertPosition, PropertyValue} from './Types'
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
    componentType = 'app' as ComponentType

    canInsert(insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType): boolean {
        if (insertPosition === 'inside') {
            return Boolean(this.findElement(targetItemId)?.canContain(elementType))
        }
        return Boolean(this.findParent(targetItemId)?.canContain(elementType))
    }

    insert(insertPosition: InsertPosition, selectedItemId: ElementId, elementType: ElementType): [Project, Element] {
        return this.doInsert(insertPosition, selectedItemId, elementType) as [Project, Element]
    }

    get pathSegment() {
        return ''
    }

    canContain(elementType: ElementType) {
        return elementType === 'App'
    }

}