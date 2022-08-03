import {ComponentType, ElementType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import SdStorageIcon from '@mui/icons-material/SdStorage'

type Properties = {
    readonly databaseName?: string,
    readonly collectionNames?: string[],
}

export default class BrowserDataStore extends BaseElement<Properties> implements Element {

    static get iconClass() { return SdStorageIcon }
    type(): ComponentType { return 'statefulUI' }

    get databaseName() {return this.properties.databaseName}
    get collectionNames() {return this.properties.collectionNames}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('databaseName', 'string', {state: true, fixedOnly: true}),
            propDef('collectionNames', 'string list', {state: true, fixedOnly: true}),
        ]
    }

    static get parentType(): ElementType | 'any' | null { return 'App' }
}

