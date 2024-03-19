import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {CombinedPropertyValue, ComponentType, ElementId, ElementType, PropertyDef, Show, Styling} from './Types'

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

    type(): ComponentType { return 'statelessUI' }

    get styles() {return this.properties.styles}
    get show() {return this.properties.show}

    get propertyDefs(): PropertyDef[] {
        return []
    }

    propertyValue(name: string): CombinedPropertyValue {
        return super.propertyValue(name) ?? this.properties[name]
    }

}
