import {ComponentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'
import {AccountCircle} from '@mui/icons-material'

type Properties = {
}

export default class UserLogon extends BaseElement<Properties> implements Element {

    readonly kind = 'UserLogon'
    static get iconClass() { return AccountCircle }
    type(): ComponentType { return 'statelessUI' }

    get propertyDefs(): PropertyDef[] {
        return []
    }
}