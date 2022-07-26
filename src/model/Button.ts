import {ComponentType, ElementId, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly content?: PropertyValueType<string>,
    readonly action?: PropertyExpr,
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
        super(id, name, 'Button', properties)
    }

    static is(element: Element): element is Button {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statelessUI' }

    get content() {return this.properties.content ?? this.name}
    get filled() {return this.properties.filled}
    get display() {return this.properties.display}
    get action() {return this.properties.action}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('content', 'string'),
            propDef('filled', 'boolean'),
            propDef('display', 'boolean'),
            propDef('action', 'action'),
        ]
    }
}