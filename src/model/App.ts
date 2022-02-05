import Page from './Page';
import Element from './Element'
import BaseElement from './BaseElement'
import {ElementId, ElementType, PropertyValue} from './Types'

type Properties = { author?: PropertyValue }

export default class App extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    get pages() {return this.elements as Page[]}

    insert(selectedItemId: ElementId, elementType: ElementType): [App, Element] {
        const insertResults = this.pages.map(p => p.insert(selectedItemId, elementType, this.findMaxId(elementType) + 1))
        const newPages = insertResults.map( r => r[0])
        const newElement = insertResults.map( r => r[1]).find( el => el ) as Element
        return [this.create(this.id, this.name, this.properties, newPages), newElement]
    }
}