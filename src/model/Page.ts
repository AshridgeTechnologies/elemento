import Element from './Element'
import BaseElement from './BaseElement'
import Text from './Text'
import TextInput from './TextInput'
import {ElementType} from './Types'

type Properties = { style?: string }
export default class Page extends BaseElement<Properties> implements Element {

    constructor(
        id: string,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, properties, elements)
    }

    kind: ElementType = 'Page'

    static is(element: Element): element is Page {
        return element.constructor.name === this.name
    }

    get style() { return this.properties.style }

}