import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {ComponentType, PropertyDef, PropertyValueType, Show, Styling} from './Types'

type Properties = Partial<Readonly<{
    source: PropertyValueType<string>,
    description: PropertyValueType<string>
}>> & Styling & Show

export default class Image extends BaseElement<Properties> implements Element {

    static kind = 'Image'

    static get iconClass() { return 'image' }

    get source() {return this.properties.source}
    get description() {return this.properties.description}
    get show() {return this.properties.show}
    get styles() {return this.properties.styles}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('source', 'string'),
            propDef('description', 'string'),
            propDef('show', 'boolean'),
            propDef('styles', 'styles')
        ]
    }

    type(): ComponentType {
        return 'statelessUI'
    }
}
