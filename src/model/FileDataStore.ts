import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, PropertyDef} from './Types'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

type Properties = {
}

export default class FileDataStore extends BaseElement<Properties> implements Element {

    static get iconClass() { return InsertDriveFileIcon }
    type(): ComponentType { return 'statefulUI' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

}