import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {ComponentType, ParentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'

type Properties = Partial<Readonly<{
    readonly url?: string,
}>>

export default class WebFileDataStore extends BaseElement<Properties> implements Element {

    readonly kind = 'WebFileDataStore'
    get iconClass() { return 'archive' }
    type(): ComponentType { return 'background' }

    get url() { return this.properties.url }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('url', 'string', {state: true, fixedOnly: true}),
        ]
    }

    static get parentType(): ParentType { return 'App' }
}
