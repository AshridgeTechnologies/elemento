import Page from './Page';
import Element from './Element'
import BaseElement, {equalArrays} from './BaseElement'
import {ElementType} from './Types'

type Properties = { author?: string }

export default class App extends BaseElement<Properties> implements Element {
    constructor(
        id: string,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    kind: ElementType = 'App'

    get pages() {return this.elements as Page[]}

}