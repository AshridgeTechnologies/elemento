import {ComponentType, ParentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly serverApp?: PropertyExpr,
    readonly serverUrl?: PropertyValueType<string>,
}

export default class ServerAppConnector extends BaseElement<Properties> implements Element {

    static kind = 'ServerAppConnector'
    static get parentType() { return 'App' as ParentType }
    static get iconClass() { return 'swap_vert_rounded' }
    type(): ComponentType { return 'background' }

    get serverApp() {return this.properties.serverApp}
    get serverUrl() {return this.properties.serverUrl}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('serverApp', 'expr', {state: true}),
            propDef('serverUrl', 'string', {state: true}),
        ]
    }

}

