import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementType, PropertyDef} from './Types'
import {Web} from '@mui/icons-material'

type Properties = {}

export default class Page extends BaseElement<Properties> implements Element {

    static get iconClass() { return Web }
    type(): ComponentType { return 'statefulUI' }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore', 'FileDataStore', 'MenuItem'].includes(elementType)
    }

    get propertyDefs(): PropertyDef[] { return [] }

}