import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementId, ElementType, PropertyDef, PropertyValueType} from './Types'

type Properties = { items: PropertyValueType<any[]>, selectedItem?: PropertyValueType<any>, style?: PropertyValueType<string>, width?: PropertyValueType<string | number> }

export default class List extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, 'List', properties, elements)
    }

    static is(element: Element): element is List {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statefulUI' }

    get items() { return this.properties.items }
    get selectedItem() { return this.properties.selectedItem }
    get width() { return this.properties.width }
    get style() { return this.properties.style }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('items', 'expr'),
            propDef('selectedItem', 'expr', {state: true}),
            propDef('width', 'string|number'),
            propDef('style', 'string'),
        ]
    }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore'].includes(elementType)
    }

}