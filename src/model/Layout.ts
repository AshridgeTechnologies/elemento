import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementId, ElementType, PropertyDef, PropertyValueType} from './Types'

type Properties = { horizontal?: PropertyValueType<boolean>, width?: PropertyValueType<number | string>, wrap?: PropertyValueType<boolean> }

export default class Layout extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, 'Layout', properties, elements)
    }

    static is(element: Element): element is Layout {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statelessUI' }

    isLayoutOnly() { return true }

    get horizontal() { return this.properties.horizontal ?? false }
    get width() { return this.properties.width }
    get wrap() { return this.properties.wrap ?? false }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('horizontal', 'boolean'),
            propDef('width', 'string|number'),
            propDef('wrap', 'boolean'),
        ]
    }


    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore', 'FileDataStore'].includes(elementType)
    }

}