import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import ViewListIcon from '@mui/icons-material/ViewList'
import {elementOfType} from './elements'

type Properties = { items?: PropertyValueType<any[]>, selectedItem?: PropertyValueType<any>,
    style?: PropertyValueType<string>, width?: PropertyValueType<string | number>, selectable?: PropertyValueType<boolean> }

export default class List extends BaseElement<Properties> implements Element {

    static kind = 'List'
    static get iconClass() { return ViewListIcon }
    type(): ComponentType { return 'statefulUI' }

    get items() { return this.properties.items }
    get selectedItem() { return this.properties.selectedItem }
    get width() { return this.properties.width }
    get selectable() { return this.properties.selectable }
    get style() { return this.properties.style }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('items', 'expr'),
            propDef('selectedItem', 'expr', {state: true}),
            propDef('width', 'string|number'),
            propDef('selectable', 'boolean'),
            propDef('style', 'string'),
        ]
    }

    canContain(elementType: ElementType) {
        return this.elementHasParentTypeOfThis(elementType)
    }


    private elementHasParentTypeOfThis(elementType: ElementType) {
        const parentType = elementOfType(elementType).parentType
        return parentType === this.kind || parentType === 'any'
    }
}