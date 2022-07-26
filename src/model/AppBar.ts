import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementId, ElementType, PropertyDef, PropertyValueType} from './Types'

type Properties = { title?: PropertyValueType<string> }

export default class AppBar extends BaseElement<Properties> implements Element {

    constructor(
        id: ElementId,
        name: string,
        properties: Properties,
        elements: ReadonlyArray<Element>
    ) {
        super(id, name, 'AppBar', properties, elements)
    }

    static is(element: Element): element is AppBar {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statelessUI' }


    isLayoutOnly() { return true }

    get title() { return this.properties.title }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore', 'FileDataStore', 'MenuItem'].includes(elementType)
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('title')
        ]
    }


}