import {ComponentType, ElementType, PropertyDef} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'

type Properties = {}

export default class File extends BaseElement<Properties> implements Element {

    static kind = 'File'

    static get iconClass() { return 'insert_drive_file' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    type(): ComponentType {
        return 'background'
    }

    static get parentType(): ElementType | 'any' | null { return 'FileFolder' }

}