import {ComponentType, ElementType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
type Properties = {}

export default class File extends BaseElement<Properties> implements Element {

    static kind = 'File'

    static get iconClass() { return InsertDriveFileOutlined }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    type(): ComponentType {
        return 'background'
    }

    static get parentType(): ElementType | 'any' | null { return 'FileFolder' }

}