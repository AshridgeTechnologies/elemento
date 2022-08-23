import {ComponentType, ParentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import FireplaceIcon from '@mui/icons-material/Fireplace'

type Properties = {
    readonly collections?: string,
}

export default class FirestoreDataStore extends BaseElement<Properties> implements Element {

    static kind = 'FirestoreDataStore'
    static get iconClass() { return FireplaceIcon }
    static get parentType() { return 'App' as ParentType }
    type(): ComponentType { return 'statefulUI' }

    get collections() {return this.properties.collections}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('collections', 'string multiline', {state: true, fixedOnly: true}),
        ]
    }

}

