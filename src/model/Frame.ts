import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import Element from './Element'
import {ComponentType, ParentType, PropertyDef, PropertyValueType, Show, Styling} from './Types'

type Properties = Partial<Readonly<{
    source: PropertyValueType<string>,
}>> & Styling & Show

export default class Frame extends BaseElement<Properties> implements Element {

    readonly kind = 'Frame'

    static get parentType(): ParentType { return ['Page', 'Form', 'Block'] }

    get iconClass() { return 'picture_in_picture' }

    get source() {return this.properties.source}
    get show() {return this.properties.show}
    get styles() {return this.properties.styles}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('source', 'string'),
            ...visualPropertyDefs()
        ]
    }

    type(): ComponentType {
        return 'statelessUI'
    }
}
