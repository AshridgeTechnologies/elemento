import {ComponentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'

type Properties = {
}

export default class UserLogon extends BaseElement<Properties> implements Element {

    static kind = 'UserLogon'
    static get iconClass() { return 'account_circle' }
    type(): ComponentType { return 'statelessUI' }

    get propertyDefs(): PropertyDef[] {
        return []
    }
}