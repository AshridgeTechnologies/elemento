import {ComponentType, ParentType, PropertyDef, PropertyExpr} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {parseCollections} from '../shared/CollectionConfig'

type Properties = {
    readonly collections?: string,
    readonly serverApp?: PropertyExpr,
}
export default class TinyBaseDataStore extends BaseElement<Properties> implements Element {

    readonly kind = 'TinyBaseDataStore'
    get iconClass() { return 'token' }
    static get parentType() { return 'App' as ParentType }
    type(): ComponentType { return 'statefulUI' }

    get collections() {return this.properties.collections}
    get serverApp() {return this.properties.serverApp}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('collections', 'string multiline', {state: true, fixedOnly: true}),
            propDef('serverApp', 'expr', {state: true}),
        ]
    }
}

