import Element from './Element'
import BaseElement from './BaseElement'
import {ElementId, ElementType} from './Types'

type Properties = {
    readonly contentExpr: string,
    readonly style?: string,
}

export default class Text extends BaseElement<Properties> implements Element {
    constructor(
        id:  ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, properties)
    }

    static is(element: Element): element is Text {
        return element.constructor.name === this.name
    }

    kind: ElementType = 'Text'

    get contentExpr() {return this.properties.contentExpr}
}
