import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly databaseName?: string,
    readonly collectionNames?: string[],
}

export default class BrowserDataStore extends BaseElement<Properties> implements Element {

    static kind = 'BrowserDataStore'
    static get iconClass() { return 'sd_storage' }
    type(): ComponentType { return 'statefulUI' }

    get databaseName() {return this.properties.databaseName}
    get collectionNames() {return this.properties.collectionNames}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('databaseName', 'string', {state: true, fixedOnly: true}),
            propDef('collectionNames', 'string list', {state: true, fixedOnly: true}),
        ]
    }

    static get parentType(): ParentType { return 'App' }
}

