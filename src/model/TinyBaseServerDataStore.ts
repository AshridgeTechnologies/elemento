import {ComponentType, ParentType, PropertyDef, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = Partial<Readonly<{
    collections: string,
    databaseName: PropertyValueType<string>,
}>>

export default class TinyBaseDataStore extends BaseElement<Properties> implements Element {

    readonly kind = 'TinyBaseServerDataStore'
    get iconClass() { return 'token' }
    static get parentType() { return 'App' as ParentType }
    type(): ComponentType { return 'statefulUI' }

    get collections() {return this.properties.collections}
    get databaseName() {return this.properties.databaseName}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('collections', 'string multiline', {state: true, fixedOnly: true}),
            propDef('databaseName', 'string', {state: true}),
        ]
    }
}
