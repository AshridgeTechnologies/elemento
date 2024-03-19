import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ParentType, PropertyDef} from './Types'

type Properties = {
}

export default class FileDataStore extends BaseElement<Properties> implements Element {

    readonly kind = 'FileDataStore'
    get iconClass() { return 'insert_drive_file' }
    type(): ComponentType { return 'statefulUI' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    static get parentType(): ParentType { return 'App' }
}
