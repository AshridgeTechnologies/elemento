import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'

type Properties = {
}

export default class FileDataStore extends BaseElement<Properties> implements Element {

    static kind = 'FileDataStore'
    static get iconClass() { return 'insert_drive_file' }
    type(): ComponentType { return 'statefulUI' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    static get parentType(): ParentType { return 'App' }
}