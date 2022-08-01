import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import WebAssetIcon from '@mui/icons-material/WebAsset';

type Properties = { title?: PropertyValueType<string> }

export default class AppBar extends BaseElement<Properties> implements Element {

    static get iconClass() { return WebAssetIcon }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get title() { return this.properties.title }

    canContain(elementType: ElementType) {
        return !['Project', 'App', 'AppBar', 'Page', 'MemoryDataStore', 'FileDataStore', 'MenuItem'].includes(elementType)
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('title')
        ]
    }


}