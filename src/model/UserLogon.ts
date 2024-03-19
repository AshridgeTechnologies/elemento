import {ComponentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'

type Properties = {
}

export default class UserLogon extends BaseElement<Properties> implements Element {

    readonly kind = 'UserLogon'
    get iconClass() { return 'account_circle' }
    type(): ComponentType { return 'statelessUI' }

    get propertyDefs(): PropertyDef[] {
        return []
    }
}
