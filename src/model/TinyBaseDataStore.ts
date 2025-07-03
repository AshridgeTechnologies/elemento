import {ComponentType, eventAction, ParentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = Partial<Readonly<{
    collections: string,
    storeOnDevice: boolean,
    syncWithServer: boolean,
    databaseName: PropertyValueType<string>,
    authorizeUser: PropertyExpr,
    authorizeData: PropertyExpr,
    serverUrl: PropertyValueType<string>,
}>>

export default class TinyBaseDataStore extends BaseElement<Properties> implements Element {

    readonly kind = 'TinyBaseDataStore'
    get iconClass() { return 'token' }
    static get parentType() { return 'App' as ParentType }
    type(): ComponentType { return 'statefulUI' }

    get collections() {return this.properties.collections}
    get storeOnDevice() {return this.properties.storeOnDevice ?? false}
    get syncWithServer() {return this.properties.syncWithServer ?? false}
    get databaseName() {return this.properties.databaseName}
    get authorizeUser() {return this.properties.authorizeUser}
    get authorizeData() {return this.properties.authorizeData}
    get serverUrl() {return this.properties.serverUrl}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('collections', 'string multiline', {state: true, fixedOnly: true}),
            propDef('storeOnDevice', 'boolean', {state: true, fixedOnly: true}),
            propDef('syncWithServer', 'boolean', {state: true, fixedOnly: true}),
            propDef('databaseName', 'string', {state: true}),
            propDef('authorizeUser', eventAction('$userId'), {state: true}),
            propDef('authorizeData', eventAction('$userId', '$tableId', '$rowId', '$changes'), {state: true}),
            propDef('serverUrl', 'string', {state: true}),
        ]
    }
}
