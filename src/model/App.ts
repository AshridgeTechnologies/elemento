import Page from './Page'
import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementId, ElementType, InsertPosition, PropertyValueType} from './Types'
import {createElement} from './createElement'
import {flatten, without} from 'ramda'

type Properties = { author?: PropertyValueType<string>, maxWidth?: PropertyValueType<string | number> }

export default class App extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    kind = 'App' as ElementType
    componentType = 'app' as ComponentType
    get pages() {return this.elementArray().filter( el => el.kind === 'Page') as Page[]}
    get otherComponents() {return without(this.pages, this.elementArray())}
    get topChildren() {return this.otherComponents.filter( el => el.kind === 'AppBar')}
    get bottomChildren() {return without(this.topChildren, this.otherComponents) }

    get author() { return this.properties.author}
    get maxWidth() { return this.properties.maxWidth}

    allElements() {
        return flatten(this.otherComponents.map( el => [el, el.allElements()]))
    }

    createElement(elementType: ElementType, newIdSeq: number): Element {
        return createElement(elementType, newIdSeq)
    }

    insert(insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType): [App, Element] {
        return this.doInsert(insertPosition, targetItemId, elementType) as [App, Element]
    }

    canContain(elementType: ElementType) {
        return ['Page', 'AppBar', 'MemoryDataStore', 'FileDataStore', 'Collection'].includes(elementType)
    }
}
