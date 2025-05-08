import {ComponentType, ParentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly collections?: string, databaseName?: string, databaseId?: string
}

export default class CloudflareDataStore extends BaseElement<Properties> implements Element {

    readonly kind = 'CloudflareDataStore'
    get iconClass() { return 'fireplace' }
    static get parentType() { return 'App' as ParentType }
    type(): ComponentType { return 'statefulUI' }

    get collections() {return this.properties.collections}
    get databaseName() {return this.properties.databaseName}
    get databaseId() {return this.properties.databaseId}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('collections', 'string multiline', {state: true, fixedOnly: true}),
            propDef('databaseName', 'string', {state: true, fixedOnly: true}),
            propDef('databaseId', 'string', {state: true, fixedOnly: true}),
        ]
    }
}

