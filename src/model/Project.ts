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
        super(id, name, 'Project', properties, elements)
    }

    type(): ComponentType { return 'app' }


    canInsert(insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType): boolean {
        if (insertPosition === 'inside') {
            return Boolean(this.findElement(targetItemId)?.canContain(elementType))
        }
        return Boolean(this.findParent(targetItemId)?.canContain(elementType))
    }

    insert(insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType): [Project, Element] {
        return this.doInsert(insertPosition, targetItemId, elementType) as [Project, Element]
    }

    move(insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) {
        const movedElements = movedElementIds.map(id => this.findElement(id)).filter( el => !!el) as Element[]
        const thisWithoutElements = movedElementIds.reduce((prev: Project, id)=> prev.delete(id), this)
        const newProject = thisWithoutElements.doMove(insertPosition, targetElementId, movedElements)
        const moveSucceeded = newProject !== thisWithoutElements
        return moveSucceeded ? newProject : this
    }

    get pathSegment() {
        return ''
    }

    canContain(elementType: ElementType) {
        return elementType === 'App'
    }

}