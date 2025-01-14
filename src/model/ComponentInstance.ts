import Element from './Element'
import BaseElement from './BaseElement'
import {CombinedPropertyValue, ComponentType, ElementId, ElementType, PropertyDef, Show, Styling} from './Types'
import {elementHasParentTypeOfKind} from './createElement'

type Properties = {[p: string]: any} & { componentType: ElementType }  & Styling & Show

export default class ComponentInstance extends BaseElement<Properties> implements Element {

    readonly kind: ElementType
    constructor(id: ElementId,
                name: string,
                properties: Properties ,
                elements: ReadonlyArray<Element> | undefined = undefined,) {
        super(id, name, properties, elements)
        this.kind = properties.componentType
    }

    get iconClass() { return 'width_normal' }

    type(): ComponentType {
        throw new Error('Must use project.componentType() to get the type of a ComponentInstance ' + this.name)
    }

    get styles() {return this.properties.styles}
    get show() {return this.properties.show}

    get propertyDefs(): PropertyDef[] {
        return []
    }

    propertyValue(name: string): CombinedPropertyValue {
        return super.propertyValue(name) ?? this.properties[name]
    }

    canContain(elementType: ElementType): boolean {
        return elementHasParentTypeOfKind(elementType, 'Block')
    }
}
