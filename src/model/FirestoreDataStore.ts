import {ComponentType, ParentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import FireplaceIcon from '@mui/icons-material/Fireplace'

type Properties = {
    readonly collectionSecurity?: string,
}

export default class FirestoreDataStore extends BaseElement<Properties> implements Element {

    static kind = 'FirestoreDataStore'
    static get iconClass() { return FireplaceIcon }
    static get parentType() { return 'App' as ParentType }
    type(): ComponentType { return 'statefulUI' }

    get collectionSecurity() {return this.properties.collectionSecurity}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('collectionSecurity', 'string multiline', {fixedOnly: true}),
        ]
    }

}

