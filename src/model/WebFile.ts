import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {ComponentType, ParentType, PropertyDef} from './Types'

type Properties = Partial<Readonly<{
    readonly url?: string,
}>>

export default class WebFile extends BaseElement<Properties> implements Element {

    readonly kind = 'WebFile'
    get iconClass() { return 'insert_drive_file' }
    type(): ComponentType { return 'background' }

    get url() { return this.properties.url }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('url', 'string', {state: true, fixedOnly: true}),
        ]
    }

    static get parentType(): ParentType { return ['App', 'Page'] }
}
