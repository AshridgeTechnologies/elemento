import {ComponentType, ElementId, ElementType, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'

type Properties = {
    readonly content?: PropertyValueType<string>,
    readonly action?: PropertyValueType<string>,
    readonly filled?: PropertyValueType<boolean>,
    readonly style?: PropertyValueType<string>,
    readonly display?: PropertyValueType<boolean>,
}

export default class Button extends BaseElement<Properties> implements Element {
    constructor(
        id:  ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, properties)
    }

    static is(element: Element): element is Button {
        return element.constructor.name === this.name
    }

    kind = 'Button' as ElementType
    componentType = 'statelessUI' as ComponentType

    get content() {return this.properties.content ?? this.name}
    get action() {return this.properties.action}
    get filled() {return this.properties.filled}
    get style() {return this.properties.style}
    get display() {return this.properties.display ?? true}
}