import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import Element from './Element'
import {ComponentType, PropertyDef, PropertyValueType, Show, Styling} from './Types'

type Properties = Partial<Readonly<{
    source: PropertyValueType<string>,
    description: PropertyValueType<string>
}>> & Styling & Show

export default class Image extends BaseElement<Properties> implements Element {

    readonly kind = 'Image'

    get iconClass() { return 'image' }

    get source() {return this.properties.source}
    get description() {return this.properties.description}
    get show() {return this.properties.show}
    get styles() {return this.properties.styles}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('source', 'string'),
            propDef('description', 'string'),
            ...visualPropertyDefs()
        ]
    }

    type(): ComponentType {
        return 'statelessUI'
    }
}
