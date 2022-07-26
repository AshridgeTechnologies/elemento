import {ComponentType, ElementId, ElementType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly label?: PropertyValueType<string>,
    readonly filled?: PropertyValueType<boolean>,
}

export default class Menu extends BaseElement<Properties> implements Element {
    constructor(
        id:  ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
) {
        super(id, name, 'Menu', properties, elements)
    }

    static is(element: Element): element is Menu {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statelessUI' }

    get label() {return this.properties.label ?? this.name}
    get filled() {return this.properties.filled}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('label', 'string'),
            propDef('filled', 'boolean'),
        ]
    }

    canContain(elementType: ElementType) {
        return ['MenuItem'].includes(elementType)
    }

}