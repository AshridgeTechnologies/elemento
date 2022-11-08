import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {elementOfType} from './elements'

type Properties = { horizontal?: PropertyValueType<boolean>, width?: PropertyValueType<number | string>,
    backgroundColor?: PropertyValueType<string>, wrap?: PropertyValueType<boolean> }

export default class Layout extends BaseElement<Properties> implements Element {

    static kind = 'Layout'
    static get iconClass() { return ViewModuleIcon }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get horizontal() { return this.properties.horizontal ?? false }
    get width() { return this.properties.width }
    get backgroundColor() { return this.properties.backgroundColor }
    get wrap() { return this.properties.wrap ?? false }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('horizontal', 'boolean'),
            propDef('width', 'string|number'),
            propDef('wrap', 'boolean'),
            propDef('backgroundColor', 'string'),
        ]
    }


    canContain(elementType: ElementType) {
        const parentType = elementOfType(elementType).parentType
        return parentType === this.kind || parentType === 'any'
    }

}