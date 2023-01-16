import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, PropertyDef} from './Types'
import Folder from '@mui/icons-material/FolderOutlined'

type Properties = {}

export default class FileFolder extends BaseElement<Properties> implements Element {
    static kind = 'FileFolder'
    static get iconClass() { return Folder }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    type(): ComponentType {
        return 'background'
    }

    canContain(elementType: ElementType): boolean {
        return ['File'].includes(elementType)
    }

    static get parentType(): ElementType | 'any' | null { return 'Project' }


}